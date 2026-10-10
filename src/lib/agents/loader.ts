import fs from 'fs';
import path from 'path';
import type { StageId } from '../types';

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');
const KNOWLEDGE_ROOT = path.join(process.cwd(), '.claude', 'knowledge');

const cache = new Map<string, string>();
const knowledgeCache = new Map<string, string>();

const STAGE_TO_FILE: Record<StageId, string> = {
  'needs-analysis': 'needs-analysis-agent.md',
  'outline': 'course-outline-agent.md',
  'design-docs': 'design-document-agent.md',
  'qa': 'quality-assurance-agent.md',
  'content-draft': 'content-draft-agent.md',
  'dev-support': 'dev-support-agent.md',
};

/** Agents that are tools rather than pipeline stages. */
export type ToolAgentId = 'rise-spec';

const TOOL_TO_FILE: Record<ToolAgentId, string> = {
  'rise-spec': 'rise-interactive-spec-agent.md',
};

function readSpec(key: string, fileName: string): string | null {
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const content = fs.readFileSync(path.join(AGENTS_DIR, fileName), 'utf-8');
    cache.set(key, content);
    return content;
  } catch {
    return null;
  }
}

export function loadAgentSpec(stageId: StageId): string | null {
  const fileName = STAGE_TO_FILE[stageId];
  return fileName ? readSpec(stageId, fileName) : null;
}

/** Load the spec for a tool agent (an agent that is not a pipeline stage). */
export function loadToolAgentSpec(id: ToolAgentId): string | null {
  const fileName = TOOL_TO_FILE[id];
  return fileName ? readSpec(`tool:${id}`, fileName) : null;
}

const SAFE_KNOWLEDGE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Load specific knowledge files from one directory under .claude/knowledge/.
 * Use this instead of loadAgentKnowledge when a task needs only some of the
 * files, which keeps the prompt smaller. Names are given without the .md
 * extension. Unknown or unsafe names are skipped.
 */
export function loadKnowledgeFiles(subdirectory: string, names: string[]): string {
  if (!SAFE_KNOWLEDGE_NAME.test(subdirectory)) return '';
  const cacheKey = `files:${subdirectory}:${names.join('|')}`;
  const cached = knowledgeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const sections: string[] = [];
  for (const name of names) {
    if (!SAFE_KNOWLEDGE_NAME.test(name)) continue;
    try {
      const body = fs.readFileSync(path.join(KNOWLEDGE_ROOT, subdirectory, `${name}.md`), 'utf-8');
      sections.push(`## Reference: ${name}\n\n${body.trim()}`);
    } catch {
      // skip missing files
    }
  }

  const combined = sections.join('\n\n---\n\n');
  knowledgeCache.set(cacheKey, combined);
  return combined;
}

/**
 * Load supplementary knowledge files for an agent. Reads all .md files from one
 * or more subdirectories of .claude/knowledge/ in alphabetical order within each
 * directory, concatenates them with a section header per file, and returns the
 * combined string. When multiple directories are provided they are processed in
 * order and their outputs joined with the same separator, so stage-specific
 * knowledge appears before shared knowledge.
 *
 * Returns an empty string if no directory exists, so stages without a knowledge
 * base are unaffected.
 *
 * @param subdirectory directory name (or ordered list) under .claude/knowledge/
 */
export function loadAgentKnowledge(subdirectory: string | string[]): string {
  const dirs = Array.isArray(subdirectory) ? subdirectory : [subdirectory];
  const cacheKey = dirs.join('|');
  const cached = knowledgeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const sections: string[] = [];
  for (const dir of dirs) {
    const dirPath = path.join(KNOWLEDGE_ROOT, dir);
    try {
      const entries = fs
        .readdirSync(dirPath)
        .filter((name) => name.endsWith('.md'))
        .sort();

      for (const name of entries) {
        const filePath = path.join(dirPath, name);
        try {
          const body = fs.readFileSync(filePath, 'utf-8');
          const headerName = name.replace(/\.md$/, '');
          sections.push(`## Reference: ${headerName}\n\n${body.trim()}`);
        } catch {
          // skip unreadable files
        }
      }
    } catch {
      // skip missing directories
    }
  }

  const combined = sections.join('\n\n---\n\n');
  knowledgeCache.set(cacheKey, combined);
  return combined;
}
