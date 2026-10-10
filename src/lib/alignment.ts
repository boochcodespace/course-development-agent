/**
 * Alignment data: a small machine-readable summary the Course Outline agent
 * writes at the end of the outline. It links course objectives to the modules
 * that teach them and the assessments that measure them, so the app can show
 * coverage and flag gaps.
 */

export interface AlignmentObjective {
  id: string;
  text: string;
  bloom?: string;
  dok?: number;
}

export interface AlignmentModule {
  id: string;
  title: string;
  objectiveIds: string[];
}

export interface AlignmentAssessment {
  id: string;
  type: string;
  moduleId?: string;
  objectiveIds: string[];
}

export interface AlignmentData {
  version: number;
  objectives: AlignmentObjective[];
  modules: AlignmentModule[];
  assessments: AlignmentAssessment[];
}

export type AlignmentGapKind =
  | 'objective-without-module'
  | 'objective-without-assessment'
  | 'module-without-objective'
  | 'module-without-assessment'
  | 'assessment-without-objective'
  | 'unknown-reference';

export interface AlignmentGap {
  kind: AlignmentGapKind;
  /** A plain-language sentence for the designer. */
  message: string;
  /** The id of the objective, module, or assessment the gap is about. */
  subjectId: string;
}

export interface AlignmentAnalysis {
  gaps: AlignmentGap[];
  stats: {
    objectives: number;
    modules: number;
    assessments: number;
    objectivesTaught: number;
    objectivesAssessed: number;
  };
}

export type ExtractResult =
  | { ok: true; data: AlignmentData }
  | { ok: false; reason: 'missing' | 'invalid'; message: string };

const BLOCK = /```alignment-json\s*([\s\S]*?)```/i;

const isString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString);

function validate(raw: unknown): { ok: true; data: AlignmentData } | { ok: false; message: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, message: 'The alignment data is not an object.' };
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.objectives) || !Array.isArray(r.modules) || !Array.isArray(r.assessments)) {
    return { ok: false, message: 'The alignment data needs objectives, modules, and assessments lists.' };
  }

  const objectives: AlignmentObjective[] = [];
  for (const o of r.objectives as Record<string, unknown>[]) {
    if (!o || !isString(o.id) || !isString(o.text)) {
      return { ok: false, message: 'Every objective needs an id and text.' };
    }
    objectives.push({
      id: o.id.trim(),
      text: o.text.trim(),
      bloom: isString(o.bloom) ? o.bloom.trim() : undefined,
      dok: typeof o.dok === 'number' ? o.dok : undefined,
    });
  }

  const modules: AlignmentModule[] = [];
  for (const m of r.modules as Record<string, unknown>[]) {
    if (!m || !isString(m.id) || !isString(m.title) || !isStringArray(m.objectiveIds)) {
      return { ok: false, message: 'Every module needs an id, a title, and a list of objectiveIds.' };
    }
    modules.push({ id: m.id.trim(), title: m.title.trim(), objectiveIds: m.objectiveIds.map((i) => i.trim()) });
  }

  const assessments: AlignmentAssessment[] = [];
  for (const a of r.assessments as Record<string, unknown>[]) {
    if (!a || !isString(a.id) || !isString(a.type) || !isStringArray(a.objectiveIds)) {
      return { ok: false, message: 'Every assessment needs an id, a type, and a list of objectiveIds.' };
    }
    assessments.push({
      id: a.id.trim(),
      type: a.type.trim(),
      moduleId: isString(a.moduleId) ? a.moduleId.trim() : undefined,
      objectiveIds: a.objectiveIds.map((i) => i.trim()),
    });
  }

  const ids = [...objectives, ...modules, ...assessments].map((x) => x.id);
  if (new Set(ids).size !== ids.length) {
    return { ok: false, message: 'Every id must be unique across objectives, modules, and assessments.' };
  }

  return {
    ok: true,
    data: { version: typeof r.version === 'number' ? r.version : 1, objectives, modules, assessments },
  };
}

/** Find and validate the alignment-json block in an outline's Markdown. */
export function extractAlignmentData(markdown: string): ExtractResult {
  const match = markdown.match(BLOCK);
  if (!match) {
    return {
      ok: false,
      reason: 'missing',
      message: 'This outline has no alignment data block.',
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return {
      ok: false,
      reason: 'invalid',
      message: 'The alignment data block is not valid JSON. Check for a missing comma or quote.',
    };
  }
  const result = validate(parsed);
  return result.ok
    ? { ok: true, data: result.data }
    : { ok: false, reason: 'invalid', message: result.message };
}

/** Find the gaps in an alignment data set. */
export function analyzeAlignment(data: AlignmentData): AlignmentAnalysis {
  const gaps: AlignmentGap[] = [];
  const objectiveIds = new Set(data.objectives.map((o) => o.id));
  const moduleIds = new Set(data.modules.map((m) => m.id));

  const taught = new Set<string>();
  for (const m of data.modules) {
    for (const id of m.objectiveIds) {
      if (!objectiveIds.has(id)) {
        gaps.push({
          kind: 'unknown-reference',
          subjectId: m.id,
          message: `${m.title} points to ${id}, which is not a listed objective.`,
        });
      } else {
        taught.add(id);
      }
    }
  }

  const assessed = new Set<string>();
  for (const a of data.assessments) {
    if (a.moduleId && !moduleIds.has(a.moduleId)) {
      gaps.push({
        kind: 'unknown-reference',
        subjectId: a.id,
        message: `${a.type} (${a.id}) points to ${a.moduleId}, which is not a listed module.`,
      });
    }
    const valid = a.objectiveIds.filter((id) => objectiveIds.has(id));
    for (const id of a.objectiveIds) {
      if (!objectiveIds.has(id)) {
        gaps.push({
          kind: 'unknown-reference',
          subjectId: a.id,
          message: `${a.type} (${a.id}) points to ${id}, which is not a listed objective.`,
        });
      }
    }
    if (valid.length === 0) {
      gaps.push({
        kind: 'assessment-without-objective',
        subjectId: a.id,
        message: `${a.type} (${a.id}) doesn't measure any listed objective. Tie it to one or remove it.`,
      });
    }
    valid.forEach((id) => assessed.add(id));
  }

  for (const o of data.objectives) {
    if (!taught.has(o.id)) {
      gaps.push({
        kind: 'objective-without-module',
        subjectId: o.id,
        message: `No module teaches ${o.id}: ${o.text}`,
      });
    }
    if (!assessed.has(o.id)) {
      gaps.push({
        kind: 'objective-without-assessment',
        subjectId: o.id,
        message: `No assessment measures ${o.id}: ${o.text}`,
      });
    }
  }

  for (const m of data.modules) {
    if (m.objectiveIds.filter((id) => objectiveIds.has(id)).length === 0) {
      gaps.push({
        kind: 'module-without-objective',
        subjectId: m.id,
        message: `${m.title} doesn't serve any listed objective. Tie it to one or cut it.`,
      });
    }
    const hasAssessment = data.assessments.some((a) => a.moduleId === m.id);
    if (!hasAssessment) {
      gaps.push({
        kind: 'module-without-assessment',
        subjectId: m.id,
        message: `${m.title} has no assessment of its own.`,
      });
    }
  }

  return {
    gaps,
    stats: {
      objectives: data.objectives.length,
      modules: data.modules.length,
      assessments: data.assessments.length,
      objectivesTaught: data.objectives.filter((o) => taught.has(o.id)).length,
      objectivesAssessed: data.objectives.filter((o) => assessed.has(o.id)).length,
    },
  };
}
