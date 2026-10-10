import { describe, expect, it } from 'vitest';
import { listDrafts, parseOutlineModules, upsertModuleDraft } from '@/lib/content-draft';

describe('parseOutlineModules', () => {
  it('finds module headings at different levels and cleans formatting', () => {
    const outline = [
      '# Course',
      '## Module 1: Your first 90 days',
      '### Learning objectives',
      '### **Module 2 - Giving feedback**',
      '## Module 3. Delegation',
      '## Appendix',
    ].join('\n');
    expect(parseOutlineModules(outline).map((m) => m.label)).toEqual([
      'Module 1: Your first 90 days',
      'Module 2 - Giving feedback',
      'Module 3. Delegation',
    ]);
  });

  it('ignores repeated headings and non-module headings', () => {
    const outline = '## Module 1: One\n## Module 1: One\n## Modules overview\n';
    expect(parseOutlineModules(outline)).toHaveLength(1);
  });

  it('returns an empty list when there are no modules', () => {
    expect(parseOutlineModules('# Nothing here')).toEqual([]);
  });
});

describe('upsertModuleDraft and listDrafts', () => {
  it('starts an artifact with a title and one block', () => {
    const out = upsertModuleDraft('', 'Module 1: A', 'rise', '## Module 1\nHello');
    expect(out.startsWith('# Content draft')).toBe(true);
    expect(listDrafts(out)).toEqual([{ module: 'Module 1: A', format: 'rise' }]);
  });

  it('adds a second module without touching the first', () => {
    let out = upsertModuleDraft('', 'Module 1: A', 'rise', 'FIRST');
    out = upsertModuleDraft(out, 'Module 2: B', 'ilt', 'SECOND');
    expect(out).toContain('FIRST');
    expect(out).toContain('SECOND');
    expect(listDrafts(out).map((d) => d.module)).toEqual(['Module 1: A', 'Module 2: B']);
  });

  it('replaces only the matching module and format', () => {
    let out = upsertModuleDraft('', 'Module 1: A', 'rise', 'OLD RISE');
    out = upsertModuleDraft(out, 'Module 1: A', 'ilt', 'ILT VERSION');
    out = upsertModuleDraft(out, 'Module 1: A', 'rise', 'NEW RISE');
    expect(out).not.toContain('OLD RISE');
    expect(out).toContain('NEW RISE');
    expect(out).toContain('ILT VERSION');
    expect(listDrafts(out)).toHaveLength(2);
  });

  it('handles module names with quotes and special characters', () => {
    const name = 'Module 4: "Escalations" & <edge> cases -->';
    const out = upsertModuleDraft('', name, 'rise', 'body');
    expect(listDrafts(out)).toEqual([{ module: name, format: 'rise' }]);
  });

  it('strips marker text the model echoes back', () => {
    const out = upsertModuleDraft('', 'Module 1: A', 'rise', '<!-- content-draft:end -->\nreal text');
    expect(listDrafts(out)).toHaveLength(1);
    expect(out).toContain('real text');
  });

  it('keeps hand-written text outside the blocks', () => {
    const base = '# Content draft\n\nMy own note.\n';
    const out = upsertModuleDraft(base, 'Module 1: A', 'rise', 'x');
    expect(out).toContain('My own note.');
  });
});
