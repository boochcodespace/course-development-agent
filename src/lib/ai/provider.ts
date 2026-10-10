import { getSecretsProvider } from '@/lib/secrets';
import { callAnthropic } from './providers/anthropic';
import { callGoogle } from './providers/google';
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
} from './provider-types';

export type { AIProvider, AIMessage, AICompletionOptions, AICompletionResult };

export async function getProvider(): Promise<AIProvider> {
  const secrets = getSecretsProvider();
  const saved = await secrets.get('AI_PROVIDER');
  const value = saved || process.env.AI_PROVIDER;
  if (value?.toLowerCase() === 'google') return 'google';
  return 'anthropic';
}

export async function getModelId(provider: AIProvider): Promise<string> {
  const secrets = getSecretsProvider();
  if (provider === 'google') {
    const saved = await secrets.get('GOOGLE_MODEL');
    return saved || process.env.GOOGLE_MODEL || 'gemini-2.5-pro';
  }
  const saved = await secrets.get('ANTHROPIC_MODEL');
  return saved || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
}

async function getApiKey(provider: AIProvider): Promise<string | null> {
  const secrets = getSecretsProvider();
  if (provider === 'anthropic') {
    return (await secrets.get('ANTHROPIC_API_KEY')) || process.env.ANTHROPIC_API_KEY || null;
  }
  if (provider === 'google') {
    return (await secrets.get('GOOGLE_API_KEY')) || process.env.GOOGLE_API_KEY || null;
  }
  return null;
}

const MAX_REPAIR_ATTEMPTS = 2;

let startupCheckDone = false;

async function runStartupCheck(): Promise<void> {
  if (startupCheckDone) return;
  startupCheckDone = true;

  const provider = await getProvider();
  const apiKey = await getApiKey(provider);
  if (!apiKey) {
    console.warn(
      '\n[ai] No API keys configured. Add them at http://localhost:3000 > Settings > API Keys.\n'
    );
  }
}

export async function complete(options: AICompletionOptions): Promise<AICompletionResult> {
  await runStartupCheck();

  const provider = await getProvider();
  const apiKey = await getApiKey(provider);

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const model = await getModelId(provider);
  const context = { apiKey, model };

  if (provider === 'anthropic') {
    return callAnthropic(options, context);
  }
  return callGoogle(options, context);
}

export async function completeJSON<T = unknown>(
  options: AICompletionOptions,
  validate?: (parsed: unknown) => parsed is T
): Promise<{ data: T; raw: AICompletionResult }> {
  const jsonInstruction =
    'Respond with valid JSON only. No markdown fences, no explanation outside the JSON object.';

  const augmentedOptions: AICompletionOptions = {
    ...options,
    systemPrompt: options.systemPrompt
      ? `${options.systemPrompt}\n\n${jsonInstruction}`
      : jsonInstruction,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    const result = await complete(
      attempt === 0
        ? augmentedOptions
        : {
            ...augmentedOptions,
            messages: [
              ...augmentedOptions.messages,
              {
                role: 'assistant',
                content: lastError
                  ? `My previous response had a JSON error: ${lastError.message}`
                  : '',
              },
              {
                role: 'user',
                content: `Your previous JSON response was invalid. Error: ${lastError?.message}. Please respond with corrected, valid JSON only.`,
              },
            ],
          }
    );

    try {
      let jsonStr = result.content.trim();
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      if (validate && !validate(parsed)) {
        throw new Error('Response does not match expected schema');
      }

      return { data: parsed as T, raw: result };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === MAX_REPAIR_ATTEMPTS) {
        throw new Error(
          `Failed to get valid JSON after ${MAX_REPAIR_ATTEMPTS + 1} attempts: ${lastError.message}`
        );
      }
    }
  }

  throw new Error('Unreachable');
}

export async function checkKeysConfigured(): Promise<boolean> {
  const provider = await getProvider();
  const apiKey = await getApiKey(provider);
  return !!apiKey;
}
