import { describe, expect, it } from 'vitest';
import { analyzeAlignment, extractAlignmentData } from '@/lib/alignment';

const valid = {
  version: 1,
  objectives: [
    { id: 'O1', text: 'Apply feedback models', bloom: 'Apply', dok: 3 },
    { id: 'O2', text: 'Evaluate delegation choices', bloom: 'Evaluate', dok: 3 },
  ],
  modules: [
    { id: 'M1', title: 'Giving feedback', objectiveIds: ['O1'] },
    { id: 'M2', title: 'Delegation', objectiveIds: ['O2'] },
  ],
  assessments: [
    { id: 'A1', type: 'Scenario check', moduleId: 'M1', objectiveIds: ['O1'] },
    { id: 'A2', type: 'Capstone', objectiveIds: ['O1', 'O2'] },
  ],
};

const wrap = (json: string) => `# Outline\n\nSome prose.\n\n## Alignment data (used by the Alignment map)\n\n\`\`\`alignment-json\n${json}\n\`\`\`\n`;

describe('extractAlignmentData', () => {
  it('reads a valid block surrounded by prose', () => {
    const result = extractAlignmentData(wrap(JSON.stringify(valid)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.objectives).toHaveLength(2);
      expect(result.data.assessments[1].moduleId).toBeUndefined();
    }
  });

  it('reports a missing block', () => {
    const result = extractAlignmentData('# Outline with no data');
    expect(result).toMatchObject({ ok: false, reason: 'missing' });
  });

  it('reports invalid JSON with a helpful message', () => {
    const result = extractAlignmentData(wrap('{ "objectives": [ }'));
    expect(result).toMatchObject({ ok: false, reason: 'invalid' });
    if (!result.ok) expect(result.message).toMatch(/not valid JSON/);
  });

  it('rejects a block with the wrong shape', () => {
    const result = extractAlignmentData(wrap(JSON.stringify({ objectives: [], modules: [] })));
    expect(result).toMatchObject({ ok: false, reason: 'invalid' });
  });

  it('rejects duplicate ids', () => {
    const dup = { ...valid, modules: [{ id: 'O1', title: 'Clash', objectiveIds: [] }] };
    const result = extractAlignmentData(wrap(JSON.stringify(dup)));
    expect(result).toMatchObject({ ok: false, reason: 'invalid' });
  });

  it('rejects an objective with no text', () => {
    const bad = { ...valid, objectives: [{ id: 'O1', text: '' }] };
    expect(extractAlignmentData(wrap(JSON.stringify(bad))).ok).toBe(false);
  });
});

describe('analyzeAlignment', () => {
  it('finds no gaps in complete data except a module without its own assessment', () => {
    const result = extractAlignmentData(wrap(JSON.stringify(valid)));
    if (!result.ok) throw new Error('fixture should parse');
    const { gaps, stats } = analyzeAlignment(result.data);
    expect(stats).toMatchObject({ objectives: 2, objectivesTaught: 2, objectivesAssessed: 2 });
    expect(gaps.map((g) => g.kind)).toEqual(['module-without-assessment']);
    expect(gaps[0].subjectId).toBe('M2');
  });

  it('flags an objective that no module teaches or assessment measures', () => {
    const data = {
      ...valid,
      objectives: [...valid.objectives, { id: 'O3', text: 'Create a plan' }],
    };
    const result = extractAlignmentData(wrap(JSON.stringify(data)));
    if (!result.ok) throw new Error('fixture should parse');
    const kinds = analyzeAlignment(result.data).gaps.filter((g) => g.subjectId === 'O3').map((g) => g.kind);
    expect(kinds).toEqual(['objective-without-module', 'objective-without-assessment']);
  });

  it('flags references to ids that do not exist', () => {
    const data = {
      ...valid,
      modules: [{ id: 'M1', title: 'Giving feedback', objectiveIds: ['O1', 'O9'] }, valid.modules[1]],
      assessments: [{ id: 'A1', type: 'Check', moduleId: 'M7', objectiveIds: ['O1', 'O8'] }, valid.assessments[1]],
    };
    const result = extractAlignmentData(wrap(JSON.stringify(data)));
    if (!result.ok) throw new Error('fixture should parse');
    const unknown = analyzeAlignment(result.data).gaps.filter((g) => g.kind === 'unknown-reference');
    expect(unknown.map((g) => g.message).join(' ')).toMatch(/O9/);
    expect(unknown.map((g) => g.message).join(' ')).toMatch(/M7/);
    expect(unknown.map((g) => g.message).join(' ')).toMatch(/O8/);
  });

  it('flags an assessment that measures nothing', () => {
    const data = { ...valid, assessments: [...valid.assessments, { id: 'A3', type: 'Orphan quiz', objectiveIds: [] }] };
    const result = extractAlignmentData(wrap(JSON.stringify(data)));
    if (!result.ok) throw new Error('fixture should parse');
    expect(analyzeAlignment(result.data).gaps.some((g) => g.kind === 'assessment-without-objective' && g.subjectId === 'A3')).toBe(true);
  });
});
