import fs from 'fs';
import path from 'path';

const GUIDES_ROOT = path.join(process.cwd(), 'style-guides');
const SEARCH_DIRS = ['', 'custom'];
const MAIN_FILE = 'style-guide.md';
const RULES_FILE = 'content-type-rules.md';

/** Largest amount of guide text added to a prompt, in characters. */
export const MAX_STYLE_GUIDE_CHARS = 40_000;

export const DEFAULT_STYLE_GUIDE_ID = 'default';

export interface StyleGuideInfo {
  /** Folder name, unique across built-in and custom guides. */
  id: string;
  name: string;
  /** True when the guide lives in style-guides/custom and is never committed. */
  custom: boolean;
  hasContentTypeRules: boolean;
}

export interface LoadedStyleGuide extends StyleGuideInfo {
  text: string;
  trimmed: boolean;
}

function readIfExists(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function guideName(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function isSafeId(id: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id);
}

/** Find the folder that holds a guide, checking built-in guides before custom ones. */
function resolveGuideDir(id: string): { dir: string; custom: boolean } | null {
  if (!isSafeId(id)) return null;
  for (const sub of SEARCH_DIRS) {
    const dir = path.join(GUIDES_ROOT, sub, id);
    if (fs.existsSync(path.join(dir, MAIN_FILE))) {
      return { dir, custom: sub === 'custom' };
    }
  }
  return null;
}

/** List every installed style guide, built-in guides first. */
export function listStyleGuides(): StyleGuideInfo[] {
  const found: StyleGuideInfo[] = [];
  const seen = new Set<string>();

  for (const sub of SEARCH_DIRS) {
    const root = path.join(GUIDES_ROOT, sub);
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'custom' || !isSafeId(entry.name)) continue;
      if (seen.has(entry.name)) continue;
      const main = readIfExists(path.join(root, entry.name, MAIN_FILE));
      if (main === null) continue;
      seen.add(entry.name);
      found.push({
        id: entry.name,
        name: guideName(main, entry.name),
        custom: sub === 'custom',
        hasContentTypeRules: fs.existsSync(path.join(root, entry.name, RULES_FILE)),
      });
    }
  }

  return found.sort((a, b) => Number(a.custom) - Number(b.custom) || a.name.localeCompare(b.name));
}

/**
 * Load a style guide by id. Falls back to the default guide when the id is
 * missing or unknown, so a deleted custom guide never breaks generation.
 */
export function loadStyleGuide(id?: string | null): LoadedStyleGuide | null {
  const wanted = id || DEFAULT_STYLE_GUIDE_ID;
  const resolved = resolveGuideDir(wanted) ?? resolveGuideDir(DEFAULT_STYLE_GUIDE_ID);
  if (!resolved) return null;

  const guideId = path.basename(resolved.dir);
  const main = readIfExists(path.join(resolved.dir, MAIN_FILE)) ?? '';
  const rules = readIfExists(path.join(resolved.dir, RULES_FILE));

  let text = main.trim();
  if (rules) text += `\n\n---\n\n${rules.trim()}`;

  let trimmed = false;
  if (text.length > MAX_STYLE_GUIDE_CHARS) {
    console.log(
      `[style-guide] Trimming "${guideId}" from ${text.length} to ${MAX_STYLE_GUIDE_CHARS} characters`
    );
    text = text.slice(0, MAX_STYLE_GUIDE_CHARS) + '\n[Style guide trimmed to fit the context window]';
    trimmed = true;
  }

  return {
    id: guideId,
    name: guideName(main, guideId),
    custom: resolved.custom,
    hasContentTypeRules: rules !== null,
    text,
    trimmed,
  };
}
