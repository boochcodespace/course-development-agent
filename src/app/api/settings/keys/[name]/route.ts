import { NextRequest, NextResponse } from 'next/server';
import { getSecretsProvider } from '@/lib/secrets';

const ALLOWED_KEYS = [
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'AI_PROVIDER',
  'ANTHROPIC_MODEL',
  'GOOGLE_MODEL',
];

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!ALLOWED_KEYS.includes(name)) {
      return NextResponse.json(
        { error: `Unknown key: ${name}` },
        { status: 400 }
      );
    }

    const secrets = getSecretsProvider();
    await secrets.delete(name);

    return NextResponse.json({ success: true, deleted: name });
  } catch (err) {
    console.error('[settings/keys] DELETE error:', err);
    const message = err instanceof Error ? err.message : 'Failed to delete key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
