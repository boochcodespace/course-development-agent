/**
 * Pure helpers for the Content Draft stage. A draft artifact holds one block
 * per module and format, each wrapped in hidden comment markers so a module
 * can be redrafted without touching the others.
 */

export type ContentFormat = 'rise' | 'ilt';

/** Writing knowledge files (in .claude/knowledge/content-writing) loaded for each format. */
export const CONTENT_KNOWLEDGE: Record<ContentFormat, string[]> = {
  rise: ['01-modern-learning-design-principles', '02-rise-360-writing-patterns', '05-blooms-alignment-cues'],
  ilt: [
    '01-modern-learning-design-principles',
    '03-ilt-slide-writing-patterns',
    '04-speaker-notes-structure',
    '05-blooms-alignment-cues',
  ],
};

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  rise: 'Rise 360 blocks',
  ilt: 'ILT slides with speaker notes',
};

export interface OutlineModule {
  /** Full heading text, for example "Module 2: Giving feedback". */
  label: string;
}

export interface DraftEntry {
  module: string;
  format: ContentFormat;
}

const MODULE_HEADING = /^#{2,4}\s+[*_`]*(Module\s+\d+\b[^\n]*)$/gim;
const BLOCK = /<!-- content-draft:start module="([^"]*)" format="(rise|ilt)" -->([\s\S]*?)<!-- content-draft:end -->/g;

function cleanLabel(raw: string): string {
  return raw.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}

/** Find the modules in a Course Outline written in Markdown. */
export function parseOutlineModules(outlineMarkdown: string): OutlineModule[] {
  const seen = new Set<string>();
  const modules: OutlineModule[] = [];
  for (const match of outlineMarkdown.matchAll(MODULE_HEADING)) {
    const label = cleanLabel(match[1]);
    if (label && !seen.has(label)) {
      seen.add(label);
      modules.push({ label });
    }
  }
  return modules;
}

/**
 * Escape only what could break an HTML comment attribute (quotes, angle
 * brackets, hyphens, line breaks, and the escape character itself), so module
 * names stay readable in the raw editor.
 */
function encodeName(name: string): string {
  return name.replace(/[%"<>\-\r\n]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
}

function startMarker(module: string, format: ContentFormat): string {
  return `<!-- content-draft:start module="${encodeName(module)}" format="${format}" -->`;
}

const END_MARKER = '<!-- content-draft:end -->';

/** Remove any marker text the model might have echoed back. */
function stripMarkers(text: string): string {
  return text.replace(/<!--\s*content-draft:[^>]*-->/g, '');
}

/**
 * Add or replace the draft for one module and format. Other modules are left
 * exactly as they were.
 */
export function upsertModuleDraft(
  artifact: string,
  module: string,
  format: ContentFormat,
  section: string
): string {
  const block = `${startMarker(module, format)}\n${stripMarkers(section).trim()}\n${END_MARKER}`;
  const key = encodeName(module);

  let replaced = false;
  const updated = artifact.replace(BLOCK, (whole, mod: string, fmt: string) => {
    if (mod === key && fmt === format) {
      replaced = true;
      return block;
    }
    return whole;
  });
  if (replaced) return updated;

  const base = artifact.trim() ? artifact.trimEnd() : '# Content draft';
  return `${base}\n\n---\n\n${block}\n`;
}

/** List which modules have been drafted, and in which format. */
export function listDrafts(artifact: string): DraftEntry[] {
  const entries: DraftEntry[] = [];
  for (const match of artifact.matchAll(BLOCK)) {
    try {
      entries.push({ module: decodeURIComponent(match[1]), format: match[2] as ContentFormat });
    } catch {
      // skip a marker that was edited by hand and no longer decodes
    }
  }
  return entries;
}
