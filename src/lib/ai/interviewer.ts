const CREATION_VERBS = [
  'create', 'build', 'write', 'draft', 'design', 'produce', 'make',
  'generate', 'develop', 'put together', 'outline', 'compose',
];

const ASSET_NOUNS = [
  'outline', 'course', 'module', 'lesson', 'assessment', 'quiz', 'test',
  'rubric', 'facilitator guide', 'persona', 'job aid', 'slide deck',
  'presentation', 'storyboard', 'design document', 'blueprint',
  'case study', 'scenario', 'activity', 'exercise', 'lab',
  'email', 'communication', 'proposal', 'template', 'report',
];

/**
 * Returns true when the message contains both a creation verb and an asset noun.
 * Used by the chat handler to select INTERVIEWER_AGENT instead of COURSE_DEV_AGENT.
 */
export function detectCreationIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const hasVerb = CREATION_VERBS.some((v) => lower.includes(v));
  const hasNoun = ASSET_NOUNS.some((n) => lower.includes(n));
  return hasVerb && hasNoun;
}
