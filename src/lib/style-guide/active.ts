import { getSecretsProvider } from '../secrets';
import { DEFAULT_STYLE_GUIDE_ID, loadStyleGuide, type LoadedStyleGuide } from './loader';

/** The secrets key that stores the id of the active style guide. */
export const STYLE_GUIDE_KEY = 'STYLE_GUIDE';

/** Read the active style guide id from settings, then the environment, then the default. */
export async function getActiveStyleGuideId(): Promise<string> {
  try {
    const stored = await getSecretsProvider().get(STYLE_GUIDE_KEY);
    if (stored) return stored;
  } catch {
    // fall through to the environment
  }
  return process.env.STYLE_GUIDE || DEFAULT_STYLE_GUIDE_ID;
}

/** Load the guide the user selected in Settings. */
export async function loadActiveStyleGuide(): Promise<LoadedStyleGuide | null> {
  return loadStyleGuide(await getActiveStyleGuideId());
}
