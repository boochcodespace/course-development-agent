// Secrets provider abstraction. Same pattern as lib/ai/provider.ts: define an
// interface, implement one concrete provider today, swap via env var later.
// Adding a second provider (AWS Secrets Manager, macOS Keychain via keytar,
// Doppler, etc.) means dropping a new file in providers/ and adding a case
// to the factory in index.ts. Calling code never imports a concrete provider
// directly; it always goes through getSecretsProvider().

export interface SecretsProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  isConfigured(): Promise<boolean>;
}
