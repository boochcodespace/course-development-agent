import { describe, expect, it } from 'vitest';
import { extractPipelineAction } from '@/lib/ai/pipeline-context';
import { PIPELINE_STAGES, createInitialStages, normalizeStages } from '@/lib/types';

describe('normalizeStages', () => {
  it('adds a stage a saved project does not have yet and keeps history', () => {
    const old = createInitialStages().filter((s) => s.id !== 'content-draft');
    old[0] = { ...old[0], status: 'committed', currentVersion: 2 };
    const result = normalizeStages(old);
    expect(result.map((s) => s.id)).toEqual(PIPELINE_STAGES.map((s) => s.id));
    expect(result[0]).toMatchObject({ status: 'committed', currentVersion: 2 });
    expect(result.find((s) => s.id === 'content-draft')?.status).toBe('not-started');
  });

  it('builds the full list when a project has no stages', () => {
    expect(normalizeStages(undefined)).toHaveLength(PIPELINE_STAGES.length);
  });

  it('does not make Dev Support depend on the optional Content Draft', () => {
    const dev = PIPELINE_STAGES.find((s) => s.id === 'dev-support');
    expect(dev?.dependsOn).toEqual(['qa']);
    expect(PIPELINE_STAGES.find((s) => s.id === 'content-draft')?.optional).toBe(true);
  });
});

describe('extractPipelineAction', () => {
  it('returns the prose and the parsed action', () => {
    const raw = 'Brief approved.\n\n```pipeline-action\n{"type":"generate","stageId":"needs-analysis"}\n```';
    const { content, action } = extractPipelineAction(raw);
    expect(action).toMatchObject({ type: 'generate', stageId: 'needs-analysis' });
    expect(content).toBe('Brief approved.');
  });

  it('leaves the message alone when there is no action', () => {
    expect(extractPipelineAction('Just talking.')).toEqual({ content: 'Just talking.', action: null });
  });

  it('keeps the message and returns no action when the JSON is broken', () => {
    const raw = '```pipeline-action\n{ nope }\n```';
    const { content, action } = extractPipelineAction(raw);
    expect(action).toBeNull();
    expect(content).toBe(raw);
  });
});

import { splitFrontMatter } from '@/lib/markdown';

describe('splitFrontMatter', () => {
  it('separates leading YAML from the body', () => {
    const { frontMatter, body } = splitFrontMatter('---\ncomponent_id: RISE-x\nstatus: draft\n---\n\n# 1. Summary\nText');
    expect(frontMatter).toBe('component_id: RISE-x\nstatus: draft');
    expect(body.startsWith('\n# 1. Summary')).toBe(true);
  });

  it('leaves a document without front matter alone', () => {
    expect(splitFrontMatter('# Title\n\n---\n\nrule above')).toEqual({ frontMatter: null, body: '# Title\n\n---\n\nrule above' });
  });

  it('does not treat a later horizontal rule pair as front matter', () => {
    const doc = 'Intro\n\n---\nnot yaml\n---\n';
    expect(splitFrontMatter(doc).frontMatter).toBeNull();
  });
});
