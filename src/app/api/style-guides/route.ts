import { NextRequest, NextResponse } from 'next/server';
import { getSecretsProvider } from '@/lib/secrets';
import { listStyleGuides } from '@/lib/style-guide/loader';
import { STYLE_GUIDE_KEY, getActiveStyleGuideId } from '@/lib/style-guide/active';

export async function GET() {
  try {
    const guides = listStyleGuides();
    const requested = await getActiveStyleGuideId();
    // Report the guide that is actually used, since a deleted guide falls back to the default.
    const active = guides.some((g) => g.id === requested) ? requested : 'default';
    return NextResponse.json({ guides, active });
  } catch (err) {
    console.error('[style-guides] GET error:', err);
    return NextResponse.json({ error: 'Failed to list style guides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (typeof id !== 'string' || !listStyleGuides().some((g) => g.id === id)) {
      return NextResponse.json({ error: 'Unknown style guide.' }, { status: 400 });
    }
    await getSecretsProvider().set(STYLE_GUIDE_KEY, id);
    return NextResponse.json({ active: id });
  } catch (err) {
    console.error('[style-guides] POST error:', err);
    return NextResponse.json({ error: 'Failed to save style guide choice' }, { status: 500 });
  }
}
