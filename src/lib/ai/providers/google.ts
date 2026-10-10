import { createHash } from 'crypto';
import { logCacheEvent, estimateTokens } from '../cache-log';
import type { AICompletionOptions, AICompletionResult } from '../provider-types';

// Google adapter with Gemini context caching.
//
// Explicit caching on Gemini 2.5 Pro requires at least 32,768 tokens of cached
// content. Our composed system prompt is well below that most of the time, so
// the common path is "skip with reason=below_threshold" logged once per session.
// Above threshold we create a CachedContent via GoogleAICacheManager, reuse it
// for the same prompt hash, and invalidate when the hash changes (which happens
// automatically when CLAUDE.md or project context changes since both flow into
// the composed prompt).
//
// TTL defaults to 1 hour (3600s). Chosen to cover a typical focused session
// without running up unnecessary storage. Cache auto-refreshes on invalidation.

const MIN_CACHE_TOKENS = 32_768;
const CACHE_TTL_SECONDS = 3600;

interface CacheEntry {
  name: string;
  hash: string;
  createdAt: number;
}

interface CachedContentHandle {
  name?: string;
  displayName?: string;
  model?: string;
  expireTime?: string;
}

interface CacheManager {
  create(request: {
    model: string;
    displayName?: string;
    systemInstruction?: string;
    contents?: Array<{ role: string; parts: Array<{ text: string }> }>;
    ttlSeconds?: number;
  }): Promise<CachedContentHandle>;
  delete(name: string): Promise<void>;
}

const cacheByHash = new Map<string, CacheEntry>();

function hashSystemPrompt(systemPrompt: string, model: string): string {
  return createHash('sha256').update(`${model}\0${systemPrompt}`).digest('hex');
}

async function getCacheManager(apiKey: string): Promise<CacheManager | null> {
  try {
    const mod = await import('@google/generative-ai/server');
    const ManagerCtor = (mod as unknown as {
      GoogleAICacheManager?: new (apiKey: string) => CacheManager;
    }).GoogleAICacheManager;
    if (!ManagerCtor) return null;
    return new ManagerCtor(apiKey);
  } catch {
    return null;
  }
}

async function tryCreateCache(
  apiKey: string,
  model: string,
  systemPrompt: string,
  hash: string
): Promise<CacheEntry | null> {
  const manager = await getCacheManager(apiKey);
  if (!manager) {
    logCacheEvent({
      provider: 'google',
      kind: 'skip',
      reason: 'cache_manager_unavailable',
    });
    return null;
  }

  try {
    const handle = await manager.create({
      model: `models/${model}`,
      displayName: `course-agent-${hash.slice(0, 12)}`,
      systemInstruction: systemPrompt,
      ttlSeconds: CACHE_TTL_SECONDS,
    });
    if (!handle.name) {
      logCacheEvent({
        provider: 'google',
        kind: 'miss',
        reason: 'create_returned_no_name',
      });
      return null;
    }
    const entry: CacheEntry = {
      name: handle.name,
      hash,
      createdAt: Date.now(),
    };
    cacheByHash.set(hash, entry);
    logCacheEvent({
      provider: 'google',
      kind: 'success',
      cachedTokens: estimateTokens(systemPrompt),
      reason: 'cache_created',
      cacheKey: hash,
    });
    return entry;
  } catch (err) {
    logCacheEvent({
      provider: 'google',
      kind: 'miss',
      reason: err instanceof Error ? err.message : 'cache_create_failed',
      fullInputTokens: estimateTokens(systemPrompt),
    });
    return null;
  }
}

async function invalidateStaleEntries(apiKey: string, activeHash: string): Promise<void> {
  const manager = await getCacheManager(apiKey);
  if (!manager) return;

  for (const [hash, entry] of cacheByHash.entries()) {
    if (hash === activeHash) continue;
    try {
      await manager.delete(entry.name);
      logCacheEvent({
        provider: 'google',
        kind: 'invalidated',
        reason: 'prompt_hash_changed',
        cacheKey: hash,
      });
    } catch {
      // Best-effort cleanup; do not block the request on delete failure.
    }
    cacheByHash.delete(hash);
  }
}

export async function callGoogle(
  options: AICompletionOptions,
  context: { apiKey: string; model: string }
): Promise<AICompletionResult> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(context.apiKey);

  const systemPrompt = options.systemPrompt || '';
  const estimated = estimateTokens(systemPrompt);
  const hash = hashSystemPrompt(systemPrompt, context.model);

  let cacheEntry: CacheEntry | null = null;

  if (systemPrompt && estimated >= MIN_CACHE_TOKENS) {
    await invalidateStaleEntries(context.apiKey, hash);
    cacheEntry = cacheByHash.get(hash) || null;
    if (!cacheEntry) {
      cacheEntry = await tryCreateCache(context.apiKey, context.model, systemPrompt, hash);
    } else {
      logCacheEvent({
        provider: 'google',
        kind: 'hit',
        cachedTokens: estimated,
        cacheKey: hash,
        savingsPct: 75,
      });
    }
  } else if (systemPrompt) {
    logCacheEvent({
      provider: 'google',
      kind: 'skip',
      reason: `below_threshold (${estimated} < ${MIN_CACHE_TOKENS})`,
    });
  }

  const history = options.messages
    .filter((m) => m.role !== 'system')
    .slice(0, -1)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  const lastMessage = options.messages.filter((m) => m.role !== 'system').slice(-1)[0];

  let response;
  try {
    if (cacheEntry) {
      const genModel = (
        client as unknown as {
          getGenerativeModelFromCachedContent?: (handle: {
            name: string;
          }) => {
            generateContent: (input: string) => Promise<{
              response: {
                text: () => string;
                candidates?: Array<{ finishReason?: string }>;
                usageMetadata?: {
                  promptTokenCount?: number;
                  candidatesTokenCount?: number;
                  cachedContentTokenCount?: number;
                };
              };
            }>;
          };
        }
      ).getGenerativeModelFromCachedContent?.({ name: cacheEntry.name });

      if (!genModel) {
        logCacheEvent({
          provider: 'google',
          kind: 'miss',
          reason: 'cached_model_helper_unavailable',
        });
        cacheEntry = null;
      } else {
        const content = [
          ...history.map((h) => `${h.role}: ${h.parts[0].text}`),
          `user: ${lastMessage?.content || ''}`,
        ].join('\n\n');
        response = await genModel.generateContent(content);
      }
    }

    if (!response) {
      const genModel = client.getGenerativeModel({ model: context.model });
      const chat = genModel.startChat({
        history: history.length > 0 ? history : undefined,
        systemInstruction: systemPrompt
          ? { role: 'system', parts: [{ text: systemPrompt }] }
          : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens || 4096,
        },
      });
      response = await chat.sendMessage(lastMessage?.content || '');
    }
  } catch (err) {
    if (cacheEntry) {
      logCacheEvent({
        provider: 'google',
        kind: 'miss',
        reason: `cached_call_failed: ${err instanceof Error ? err.message : 'unknown'}`,
      });
      cacheByHash.delete(hash);
    }
    throw err;
  }

  const r = response.response;
  const content = r.text();

  const finishReason = r.candidates?.[0]?.finishReason as string | undefined;
  const truncated = finishReason === 'MAX_TOKENS';
  if (truncated) {
    console.warn(
      `[ai] Google response truncated at MAX_TOKENS (candidatesTokenCount=${r.usageMetadata?.candidatesTokenCount ?? 'unknown'})`
    );
  }

  return {
    content,
    provider: 'google',
    model: context.model,
    usage: r.usageMetadata
      ? {
          inputTokens: r.usageMetadata.promptTokenCount || 0,
          outputTokens: r.usageMetadata.candidatesTokenCount || 0,
        }
      : undefined,
    cached: !!cacheEntry,
    truncated,
    stopReason: finishReason,
  };
}
