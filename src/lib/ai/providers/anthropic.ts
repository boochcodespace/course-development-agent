import { logCacheEvent } from '../cache-log';
import type { AICompletionOptions, AICompletionResult } from '../provider-types';

// Anthropic adapter. Prompt caching is deterministic: set cache_control on the
// system block and the response usage reports cache_read_input_tokens and
// cache_creation_input_tokens. We translate that into structured cache events.

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export async function callAnthropic(
  options: AICompletionOptions,
  context: { apiKey: string; model: string }
): Promise<AICompletionResult> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: context.apiKey });

  const systemBlocks: Array<{
    type: 'text';
    text: string;
    cache_control?: { type: 'ephemeral' };
  }> = [];
  if (options.systemPrompt) {
    systemBlocks.push({
      type: 'text',
      text: options.systemPrompt,
      cache_control: { type: 'ephemeral' },
    });
  }

  const messages = options.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  let response;
  try {
    response = await client.messages.create({
      model: context.model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.3,
      system: systemBlocks.length > 0 ? systemBlocks : undefined,
      messages,
    });
  } catch (err) {
    logCacheEvent({
      provider: 'anthropic',
      kind: 'miss',
      reason: err instanceof Error ? err.message : 'api_error',
    });
    throw err;
  }

  const usage = response.usage as AnthropicUsage;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const cacheCreated = usage.cache_creation_input_tokens || 0;
  const freshInput = usage.input_tokens || 0;

  if (cacheRead > 0) {
    const totalInputIfFull = cacheRead + freshInput;
    const savingsPct = totalInputIfFull > 0
      ? Math.round((cacheRead / totalInputIfFull) * 90)
      : 0;
    logCacheEvent({
      provider: 'anthropic',
      kind: 'hit',
      cachedTokens: cacheRead,
      fullInputTokens: totalInputIfFull,
      savingsPct,
    });
  } else if (cacheCreated > 0) {
    logCacheEvent({
      provider: 'anthropic',
      kind: 'success',
      cachedTokens: cacheCreated,
      reason: 'cache_created',
    });
  } else if (options.systemPrompt) {
    logCacheEvent({
      provider: 'anthropic',
      kind: 'miss',
      reason: 'no_cache_usage_in_response',
      fullInputTokens: freshInput,
    });
  }

  const textBlock = response.content.find((b: { type: string }) => b.type === 'text');
  const content = textBlock && 'text' in textBlock ? (textBlock as { text: string }).text : '';

  const stopReason = response.stop_reason || undefined;
  const truncated = stopReason === 'max_tokens';
  if (truncated) {
    console.warn(
      `[ai] Anthropic response truncated at max_tokens (output_tokens=${usage.output_tokens})`
    );
  }

  return {
    content,
    provider: 'anthropic',
    model: context.model,
    usage: {
      inputTokens: freshInput,
      outputTokens: usage.output_tokens,
    },
    cached: cacheRead > 0,
    truncated,
    stopReason,
  };
}
