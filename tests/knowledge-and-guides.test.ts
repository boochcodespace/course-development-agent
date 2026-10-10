import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadKnowledgeFiles, loadAgentSpec, loadToolAgentSpec } from '@/lib/agents/loader';
import { CONTENT_KNOWLEDGE } from '@/lib/content-draft';
import { LMS_PROFILES, RISE_SPEC_CORE_KNOWLEDGE } from '@/lib/rise-spec';
import { PIPELINE_STAGES } from '@/lib/types';
import { DEFAULT_STYLE_GUIDE_ID, listStyleGuides, loadStyleGuide } from '@/lib/style-guide/loader';

const knowledgeDir = (d: string) => path.join(process.cwd(), '.claude', 'knowledge', d);

describe('knowledge files named in code actually exist', () => {
  it('content-writing files for every format', () => {
    for (const names of Object.values(CONTENT_KNOWLEDGE)) {
      for (const name of names) {
        expect(fs.existsSync(path.join(knowledgeDir('content-writing'), `${name}.md`)), name).toBe(true);
      }
    }
  });

  it('rise-spec core files and every LMS profile', () => {
    for (const name of RISE_SPEC_CORE_KNOWLEDGE) {
      expect(fs.existsSync(path.join(knowledgeDir('rise-spec'), `${name}.md`)), name).toBe(true);
    }
    for (const p of LMS_PROFILES) {
      expect(fs.existsSync(path.join(knowledgeDir('rise-spec'), `lms-${p.id}.md`)), p.id).toBe(true);
    }
    expect(fs.existsSync(path.join(knowledgeDir('rise-spec'), 'learning-science.md'))).toBe(true);
  });

  it('the dev-support extras exist', () => {
    for (const name of ['interaction-types', 'rise-constraints']) {
      expect(fs.existsSync(path.join(knowledgeDir('rise-spec'), `${name}.md`)), name).toBe(true);
    }
  });
});

describe('agent specs', () => {
  it('every pipeline stage has a spec file', () => {
    for (const stage of PIPELINE_STAGES) {
      expect(loadAgentSpec(stage.id), stage.id).toBeTruthy();
    }
  });

  it('the Rise spec tool agent has a spec file', () => {
    expect(loadToolAgentSpec('rise-spec')).toContain('16-section');
  });
});

describe('loadKnowledgeFiles', () => {
  it('loads the named files with a header for each', () => {
    const out = loadKnowledgeFiles('rise-spec', ['rise-constraints', 'lms-generic']);
    expect(out).toContain('## Reference: rise-constraints');
    expect(out).toContain('## Reference: lms-generic');
  });

  it('skips unknown and unsafe names', () => {
    expect(loadKnowledgeFiles('rise-spec', ['nope', '../../CLAUDE', 'a/b'])).toBe('');
  });

  it('refuses an unsafe directory', () => {
    expect(loadKnowledgeFiles('../src', ['x'])).toBe('');
  });
});

describe('style guides', () => {
  it('lists the default guide first', () => {
    const guides = listStyleGuides();
    expect(guides[0].id).toBe(DEFAULT_STYLE_GUIDE_ID);
    expect(guides[0].custom).toBe(false);
  });

  it('loads the default guide', () => {
    const guide = loadStyleGuide('default');
    expect(guide?.text).toContain('Plain-language style guide');
    expect(guide?.hasContentTypeRules).toBe(true);
  });

  it('falls back to the default for unknown and unsafe ids', () => {
    expect(loadStyleGuide('does-not-exist')?.id).toBe('default');
    expect(loadStyleGuide('../../etc')?.id).toBe('default');
    expect(loadStyleGuide(null)?.id).toBe('default');
  });
});
