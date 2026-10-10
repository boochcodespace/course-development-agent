import { NextRequest, NextResponse } from 'next/server';
import { getSecretsProvider } from '@/lib/secrets';

function maskKey(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 6) return '***';
  return '***' + value.slice(-6);
}

export async function GET() {
  try {
    const secrets = getSecretsProvider();
    const [anthropicKey, googleKey, activeProvider, anthropicModel, googleModel] =
      await Promise.all([
        secrets.get('ANTHROPIC_API_KEY'),
        secrets.get('GOOGLE_API_KEY'),
        secrets.get('AI_PROVIDER'),
        secrets.get('ANTHROPIC_MODEL'),
        secrets.get('GOOGLE_MODEL'),
      ]);

    return NextResponse.json({
      anthropicApiKey: maskKey(anthropicKey),
      googleApiKey: maskKey(googleKey),
      activeProvider: activeProvider || process.env.AI_PROVIDER || 'anthropic',
      anthropicModel: anthropicModel || process.env.ANTHROPIC_MODEL || '',
      googleModel: googleModel || process.env.GOOGLE_MODEL || '',
      anthropicConfigured: !!anthropicKey,
      googleConfigured: !!googleKey,
      anthropicEnvVar: !!process.env.ANTHROPIC_API_KEY,
      googleEnvVar: !!process.env.GOOGLE_API_KEY,
    });
  } catch (err) {
    console.error('[settings/keys] GET error:');
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to read key configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anthropicApiKey, googleApiKey, activeProvider, anthropicModel, googleModel } = body;

    const secrets = getSecretsProvider();
    const writes: Promise<void>[] = [];

    if (anthropicApiKey !== undefined && anthropicApiKey !== null) {
      if (anthropicApiKey === '') {
        writes.push(secrets.delete('ANTHROPIC_API_KEY'));
      } else {
        writes.push(secrets.set('ANTHROPIC_API_KEY', anthropicApiKey));
      }
    }

    if (googleApiKey !== undefined && googleApiKey !== null) {
      if (googleApiKey === '') {
        writes.push(secrets.delete('GOOGLE_API_KEY'));
      } else {
        writes.push(secrets.set('GOOGLE_API_KEY', googleApiKey));
      }
    }

    if (activeProvider) {
      writes.push(secrets.set('AI_PROVIDER', activeProvider));
    }

    if (anthropicModel !== undefined) {
      if (anthropicModel === '') {
        writes.push(secrets.delete('ANTHROPIC_MODEL'));
      } else {
        writes.push(secrets.set('ANTHROPIC_MODEL', anthropicModel));
      }
    }

    if (googleModel !== undefined) {
      if (googleModel === '') {
        writes.push(secrets.delete('GOOGLE_MODEL'));
      } else {
        writes.push(secrets.set('GOOGLE_MODEL', googleModel));
      }
    }

    await Promise.all(writes);

    const [savedAnthropic, savedGoogle, savedProvider, savedAnthropicModel, savedGoogleModel] =
      await Promise.all([
        secrets.get('ANTHROPIC_API_KEY'),
        secrets.get('GOOGLE_API_KEY'),
        secrets.get('AI_PROVIDER'),
        secrets.get('ANTHROPIC_MODEL'),
        secrets.get('GOOGLE_MODEL'),
      ]);

    return NextResponse.json({
      success: true,
      anthropicApiKey: maskKey(savedAnthropic),
      googleApiKey: maskKey(savedGoogle),
      activeProvider: savedProvider || 'anthropic',
      anthropicModel: savedAnthropicModel || '',
      googleModel: savedGoogleModel || '',
    });
  } catch (err) {
    console.error('[settings/keys] POST error:');
    console.error(err);
    const message = err instanceof Error ? err.message : 'Failed to save keys';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
