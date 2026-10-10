import { NextRequest, NextResponse } from 'next/server';
import { getSecretsProvider } from '@/lib/secrets';

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (provider !== 'anthropic' && provider !== 'google') {
      return NextResponse.json(
        { success: false, error: 'Provider must be "anthropic" or "google"' },
        { status: 400 }
      );
    }

    const secrets = getSecretsProvider();

    if (provider === 'anthropic') {
      const apiKey =
        (await secrets.get('ANTHROPIC_API_KEY')) || process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: 'No Anthropic API key configured. Add one in the API Keys settings.',
        });
      }

      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey });
        const model =
          (await secrets.get('ANTHROPIC_MODEL')) ||
          process.env.ANTHROPIC_MODEL ||
          'claude-sonnet-4-5';

        await client.messages.create({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say "ok"' }],
        });

        return NextResponse.json({ success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message });
      }
    }

    if (provider === 'google') {
      const apiKey =
        (await secrets.get('GOOGLE_API_KEY')) || process.env.GOOGLE_API_KEY;

      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: 'No Google API key configured. Add one in the API Keys settings.',
        });
      }

      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const client = new GoogleGenerativeAI(apiKey);
        const model =
          (await secrets.get('GOOGLE_MODEL')) ||
          process.env.GOOGLE_MODEL ||
          'gemini-2.5-pro';

        const genModel = client.getGenerativeModel({ model });
        await genModel.generateContent('Say "ok"');

        return NextResponse.json({ success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message });
      }
    }

    return NextResponse.json({ success: false, error: 'Unknown provider' });
  } catch (err) {
    console.error('[settings/keys/test] error:', err);
    return NextResponse.json(
      { success: false, error: 'Test request failed' },
      { status: 500 }
    );
  }
}
