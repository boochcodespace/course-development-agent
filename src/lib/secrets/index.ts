import { SecretsProvider } from './provider';
import { LocalFileSecretsProvider } from './providers/local-file';

export type SecretsProviderType = 'local-file';

let cachedProvider: SecretsProvider | null = null;

export function getSecretsProvider(): SecretsProvider {
  if (cachedProvider) return cachedProvider;

  const providerType =
    (process.env.SECRETS_PROVIDER as SecretsProviderType) || 'local-file';

  switch (providerType) {
    case 'local-file':
    default:
      cachedProvider = new LocalFileSecretsProvider();
      break;
  }

  return cachedProvider;
}

export type { SecretsProvider } from './provider';
