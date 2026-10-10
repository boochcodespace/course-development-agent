/**
 * Shared, pure helpers for the Interactive spec tool. Used by both the form
 * (to give instant feedback) and the API route (to validate the request).
 */

export interface LmsProfile {
  id: string;
  label: string;
}

/**
 * LMS profiles the tool offers. To add one, create
 * .claude/knowledge/rise-spec/lms-<id>.md and add an entry here.
 */
export const LMS_PROFILES: LmsProfile[] = [
  { id: 'generic', label: 'Generic (SCORM, xAPI, or cmi5)' },
  { id: 'docebo', label: 'Docebo' },
];

export const DEFAULT_LMS_PROFILE = 'generic';

export function isKnownLmsProfile(id: unknown): id is string {
  return typeof id === 'string' && LMS_PROFILES.some((p) => p.id === id);
}

export const INTERACTION_TYPES: { id: string; label: string }[] = [
  { id: 'drag-and-drop-categorization', label: 'Drag-and-drop categorization' },
  { id: 'click-to-reveal-hotspots', label: 'Click-to-reveal hotspots' },
  { id: 'branching-scenario', label: 'Branching scenario' },
  { id: 'sortable-sequence', label: 'Sortable sequence or timeline' },
  { id: 'decision-tree-explorer', label: 'Decision tree explorer' },
  { id: 'flip-card-grid', label: 'Flip card grid' },
  { id: 'scenario-simulator', label: 'Scenario simulator' },
  { id: 'interactive-diagram', label: 'Interactive diagram' },
];

export const MAX_FIELD = {
  topic: 300,
  objective: 600,
  persona: 800,
  source: 30_000,
  brandTokens: 2_000,
} as const;

// Verbs that can't be measured. These are blocked outright.
const VAGUE_VERBS = ['understand', 'learn', 'know', 'appreciate', 'become aware', 'be aware', 'become familiar', 'be familiar'];

// Remember and Understand level verbs. Allowed, but the agent proposes a stronger objective.
const LOW_LEVEL_VERBS = [
  'define', 'list', 'recall', 'identify', 'name', 'recognize', 'remember', 'state', 'label', 'match',
  'explain', 'summarize', 'paraphrase', 'classify', 'describe', 'discuss',
];

export type ObjectiveLevel = 'ok' | 'low' | 'vague' | 'missing';

export interface ObjectiveCheck {
  level: ObjectiveLevel;
  message: string;
}

/** Strip the common lead-in so the first word that is left is the verb. */
function leadingVerbPhrase(objective: string): string {
  return objective
    .trim()
    .toLowerCase()
    .replace(/^by the end of (this|the) [a-z -]+?,?\s*(the )?(learner|learners|you)\s+will be able to\s+/, '')
    .replace(/^(the )?(learner|learners|you)\s+(will|can)\s+(be able to\s+)?/, '')
    .replace(/^to\s+/, '');
}

/** Check a learning objective's verb. */
export function checkObjective(objective: string): ObjectiveCheck {
  const phrase = leadingVerbPhrase(objective);
  if (!phrase) {
    return { level: 'missing', message: 'Write one learning objective that starts with an action verb.' };
  }
  const vague = VAGUE_VERBS.find((v) => phrase === v || phrase.startsWith(`${v} `));
  if (vague) {
    return {
      level: 'vague',
      message: `"${vague}" can't be observed or measured. Use an Apply-level verb such as apply, sequence, choose, or troubleshoot.`,
    };
  }
  const low = LOW_LEVEL_VERBS.find((v) => phrase === v || phrase.startsWith(`${v} `));
  if (low) {
    return {
      level: 'low',
      message: `"${low}" is a Remember or Understand verb. The agent will propose a stronger Apply-level objective and build to that one.`,
    };
  }
  return { level: 'ok', message: 'This reads as a measurable objective.' };
}

export interface RiseSpecRequest {
  topic: string;
  objective: string;
  persona: string;
  sourceContent?: string;
  interactionPreference?: string;
  lmsProfile: string;
  brandTokens?: string;
  includeResearch?: boolean;
}

/** Validate a request body. Returns an error message, or null when it is valid. */
export function validateRiseSpecRequest(body: Partial<RiseSpecRequest> | null | undefined): string | null {
  if (!body || typeof body !== 'object') return 'Send the form fields as JSON.';
  const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  if (!text(body.topic)) return 'Add a topic.';
  if (!text(body.objective)) return 'Add a learning objective.';
  if (!text(body.persona)) return 'Describe the learner role and context.';

  if (text(body.topic).length > MAX_FIELD.topic) return `Keep the topic under ${MAX_FIELD.topic} characters.`;
  if (text(body.objective).length > MAX_FIELD.objective) return `Keep the objective under ${MAX_FIELD.objective} characters.`;
  if (text(body.persona).length > MAX_FIELD.persona) return `Keep the learner description under ${MAX_FIELD.persona} characters.`;
  if (text(body.sourceContent).length > MAX_FIELD.source) return `Keep the source content under ${MAX_FIELD.source.toLocaleString()} characters.`;
  if (text(body.brandTokens).length > MAX_FIELD.brandTokens) return `Keep the brand tokens under ${MAX_FIELD.brandTokens.toLocaleString()} characters.`;

  if (!isKnownLmsProfile(body.lmsProfile)) return 'Choose an LMS profile from the list.';

  if (
    body.interactionPreference &&
    !INTERACTION_TYPES.some((t) => t.id === body.interactionPreference)
  ) {
    return 'Choose an interaction type from the list, or leave it blank.';
  }

  if (checkObjective(text(body.objective)).level === 'vague') {
    return checkObjective(text(body.objective)).message;
  }
  return null;
}

/** The knowledge files every spec needs, in the order they are added to the prompt. */
export const RISE_SPEC_CORE_KNOWLEDGE = [
  'rise-constraints',
  'interaction-types',
  'accessibility',
  'spec-template',
  'design-principles',
];

/** Build the user message sent to the agent. */
export function buildRiseSpecMessage(req: RiseSpecRequest, interactionLabel?: string): string {
  const lines = [
    'Write a build spec for one custom interactive component.',
    '',
    `Topic: ${req.topic.trim()}`,
    `Learning objective: ${req.objective.trim()}`,
    `Learner role and context: ${req.persona.trim()}`,
    `Interaction preference: ${interactionLabel ?? 'None. Recommend the best fit.'}`,
    `LMS profile: ${req.lmsProfile}`,
  ];
  if (req.brandTokens?.trim()) {
    lines.push('', 'Brand tokens supplied by the user (reference by variable name only):', req.brandTokens.trim());
  } else {
    lines.push('', 'No brand tokens were supplied. Use placeholder token names and add "Needs brand tokens" to Open Questions.');
  }
  if (req.sourceContent?.trim()) {
    lines.push('', 'Source content to align to:', req.sourceContent.trim());
  }
  return lines.join('\n');
}
