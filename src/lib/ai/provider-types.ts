export type AIProvider = 'anthropic' | 'google';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: Record<string, unknown>;
}

export interface AICompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
  cached?: boolean;
  /** True when the model stopped because it hit the output token limit. */
  truncated?: boolean;
  /** Raw provider stop reason (stop_reason / finishReason) for diagnostics. */
  stopReason?: string;
}
