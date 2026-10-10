// Shared cache logging. Both providers emit [AI_CACHE] lines so terminal output
// stays filterable. Below-threshold skips are logged once per session to avoid
// spam (same system prompt hashed and reused across calls).

export type CacheEventKind = 'hit' | 'miss' | 'skip' | 'success' | 'invalidated';

export interface CacheEvent {
  kind: CacheEventKind;
  provider: 'anthropic' | 'google';
  reason?: string;
  cachedTokens?: number;
  fullInputTokens?: number;
  savingsPct?: number;
  cacheKey?: string;
}

const loggedSkipReasons = new Set<string>();

export function resetCacheLogSession(): void {
  loggedSkipReasons.clear();
}

function formatLine(event: CacheEvent): string {
  const ts = new Date().toISOString();
  const parts: string[] = [
    `[AI_CACHE] ${ts}`,
    `provider=${event.provider}`,
    `status=${event.kind}`,
  ];
  if (event.reason) parts.push(`reason="${event.reason}"`);
  if (event.cachedTokens !== undefined) parts.push(`cached_tokens=${event.cachedTokens}`);
  if (event.fullInputTokens !== undefined) parts.push(`full_tokens=${event.fullInputTokens}`);
  if (event.savingsPct !== undefined) parts.push(`savings=${event.savingsPct}%`);
  if (event.cacheKey) parts.push(`key=${event.cacheKey.slice(0, 12)}`);
  return parts.join(' ');
}

export function logCacheEvent(event: CacheEvent): void {
  // Skip reasons get deduplicated per session. Everything else logs every time.
  if (event.kind === 'skip' && event.reason) {
    const dedupeKey = `${event.provider}:${event.reason}`;
    if (loggedSkipReasons.has(dedupeKey)) return;
    loggedSkipReasons.add(dedupeKey);
  }

  const line = formatLine(event);
  if (event.kind === 'miss' || event.kind === 'invalidated') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

// Rough token estimate for threshold decisions (approx 4 chars per token).
// Not a substitute for the tokenizer but good enough to decide whether to
// attempt caching when the provider has a minimum token threshold.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
