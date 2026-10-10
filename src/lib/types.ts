// ── Pipeline Stages ──

export type StageId = 'needs-analysis' | 'outline' | 'design-docs' | 'qa' | 'content-draft' | 'dev-support';

export type StageStatus = 'not-started' | 'in-progress' | 'committed' | 'unlocked';

export interface StageArtifactVersion {
  version: number;
  committedAt: string | null;
  artifactMarkdown: string;
  artifactMetadata: Record<string, unknown>;
  authorNote: string | null;
  /** True when this version was produced by a chat-originated revision. */
  chatRevision?: boolean;
  /** Short summary of what the chat revision changed. */
  chatChangeDescription?: string;
}

export interface ProjectStage {
  id: StageId;
  status: StageStatus;
  currentVersion: number;
  versions: StageArtifactVersion[];
  dependsOn: StageId[];
  stale: boolean;
  updatedAt: string;
}

export const PIPELINE_STAGES: { id: StageId; label: string; dependsOn: StageId[]; optional?: boolean }[] = [
  { id: 'needs-analysis', label: 'Needs Analysis', dependsOn: [] },
  { id: 'outline', label: 'Course Outline', dependsOn: ['needs-analysis'] },
  { id: 'design-docs', label: 'Design Documents', dependsOn: ['outline'] },
  { id: 'qa', label: 'Quality Assurance', dependsOn: ['design-docs'] },
  { id: 'content-draft', label: 'Content Draft', dependsOn: ['qa'], optional: true },
  { id: 'dev-support', label: 'Dev Support', dependsOn: ['qa'] },
];

// ── ADDIE Phases ──
export type ADDIEPhase = 'analysis' | 'design' | 'development' | 'implementation' | 'evaluation';

export const ADDIE_PHASES: { key: ADDIEPhase; label: string; description: string }[] = [
  { key: 'analysis', label: 'Analysis', description: 'Learner needs, gaps, and constraints' },
  { key: 'design', label: 'Design', description: 'Objectives, structure, and strategy' },
  { key: 'development', label: 'Development', description: 'Content, activities, and assessments' },
  { key: 'implementation', label: 'Implementation', description: 'Delivery and facilitation' },
  { key: 'evaluation', label: 'Evaluation', description: 'Effectiveness and iteration' },
];

// ── Bloom's Taxonomy ──
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export const BLOOM_LEVELS: { key: BloomLevel; label: string; verbs: string[] }[] = [
  { key: 'remember', label: 'Remember', verbs: ['define', 'list', 'recall', 'identify', 'name'] },
  { key: 'understand', label: 'Understand', verbs: ['explain', 'summarize', 'paraphrase', 'classify'] },
  { key: 'apply', label: 'Apply', verbs: ['execute', 'implement', 'solve', 'demonstrate'] },
  { key: 'analyze', label: 'Analyze', verbs: ['differentiate', 'organize', 'compare', 'deconstruct'] },
  { key: 'evaluate', label: 'Evaluate', verbs: ['critique', 'judge', 'justify', 'assess'] },
  { key: 'create', label: 'Create', verbs: ['design', 'construct', 'produce', 'plan'] },
];

/**
 * Bring a saved project's stage list up to date with PIPELINE_STAGES. Adds any
 * stage the project doesn't have yet (for example one introduced in a later
 * release), keeps existing stages and their history, and returns them in
 * pipeline order.
 */
export function normalizeStages(existing: ProjectStage[] | undefined): ProjectStage[] {
  const now = new Date().toISOString();
  return PIPELINE_STAGES.map((def) => {
    const found = existing?.find((s) => s.id === def.id);
    if (found) return { ...found, dependsOn: def.dependsOn };
    return {
      id: def.id,
      status: 'not-started' as StageStatus,
      currentVersion: 0,
      versions: [],
      dependsOn: def.dependsOn,
      stale: false,
      updatedAt: now,
    };
  });
}

export function createInitialStages(): ProjectStage[] {
  const now = new Date().toISOString();
  return PIPELINE_STAGES.map((s) => ({
    id: s.id,
    status: 'not-started' as StageStatus,
    currentVersion: 0,
    versions: [],
    dependsOn: s.dependsOn,
    stale: false,
    updatedAt: now,
  }));
}

// ── Course Types ──
export type CourseType =
  | 'ilt'
  | 'self-paced'
  | 'blended'
  | 'micro-learning'
  | 'bootcamp'
  | 'certification'
  | 'performance-support'
  | 'job-aid';

export const COURSE_TYPES: { key: CourseType; label: string }[] = [
  { key: 'ilt', label: 'Instructor-Led Training' },
  { key: 'self-paced', label: 'Self-Paced E-Learning' },
  { key: 'blended', label: 'Blended Learning' },
  { key: 'micro-learning', label: 'Micro-Learning' },
  { key: 'bootcamp', label: 'Bootcamp / Workshop' },
  { key: 'certification', label: 'Certification Program' },
  { key: 'performance-support', label: 'Performance Support' },
  { key: 'job-aid', label: 'Job Aid / Reference' },
];

// ── Project ──
export interface Project {
  id: string;
  title: string;
  description: string;
  courseType: CourseType;
  targetAudience: string;
  industry: string;
  status: 'active' | 'completed' | 'archived';
  currentPhase: ADDIEPhase;
  phaseProgress: Record<ADDIEPhase, number>; // 0-100
  tags: string[];
  stages: ProjectStage[];
  /** Cross-stage context notes gathered from chat; included in future generations. */
  projectNotes: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Chat ──
export type MessageRole = 'user' | 'assistant' | 'system';

/** Structured action emitted by the chat orchestrator alongside prose. */
export type PipelineActionType = 'generate' | 'modify';

export interface PipelineActionPayload {
  type: PipelineActionType;
  stageId: StageId;
  /** Summary of context used, shown in the Pipeline Action message card. */
  contextSummary?: string;
  /** User prompt passed to the generate endpoint (for 'generate' actions). */
  userPrompt?: string;
  /** Revised Markdown produced by the agent (for 'modify' actions). */
  revisedMarkdown?: string;
  /** Short description of what changed (for 'modify' actions). */
  changeDescription?: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: string[]; // material IDs referenced
  /** When present, this message represents a pipeline action card in the UI. */
  pipelineAction?: PipelineActionPayload;
}

// ── Source Materials ──
export type MaterialType =
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'txt'
  | 'md'
  | 'rtf'
  | 'video'
  | 'audio'
  | 'url'
  | 'scorm'
  | 'image'
  | 'other';

export type MaterialCategory =
  | 'sme-content'
  | 'existing-course'
  | 'reference'
  | 'media-asset'
  | 'template'
  | 'other';

export interface MaterialAnalysis {
  keyConcepts: string[];
  suggestedObjectives: string[];
  bloomLevels: BloomLevel[];
  detectedStructure: string[];
  readabilityLevel: string;
  contentGaps: string[];
  glossaryTerms: { term: string; definition: string }[];
  accessibilityIssues: string[];
  summary: string;
}

export interface MaterialSnippet {
  id: string;
  materialId: string;
  content: string;
  page?: number;
  note?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  originalName: string;
  type: MaterialType;
  category: MaterialCategory;
  size: number;
  mimeType: string;
  tags: string[];
  notes: string;
  projectId: string;
  collectionIds: string[];
  analysis?: MaterialAnalysis;
  snippets: MaterialSnippet[];
  version: number;
  uploadedAt: string;
  updatedAt: string;
  url?: string; // for URL-type materials
  filePath?: string;
  extractedText?: string;
}

export interface MaterialCollection {
  id: string;
  name: string;
  description: string;
  materialIds: string[];
  createdAt: string;
}

// ── Tags ──
export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'client' | 'topic' | 'format' | 'status' | 'custom';
}

// ── Quick Actions ──
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
  phase?: ADDIEPhase;
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    description: 'Start a new course development project',
    prompt: 'I want to start a new course development project. Help me through the analysis phase.',
    icon: 'plus',
  },
  {
    id: 'write-objectives',
    label: 'Write Objectives',
    description: 'Generate learning objectives for a topic',
    prompt: 'Help me write learning objectives using Bloom\'s Taxonomy for my current project.',
    icon: 'target',
    phase: 'design',
  },
  {
    id: 'create-assessment',
    label: 'Create Assessment',
    description: 'Build assessments aligned to objectives',
    prompt: 'Help me create assessments aligned to my learning objectives.',
    icon: 'clipboard',
    phase: 'development',
  },
  {
    id: 'design-activity',
    label: 'Design Activity',
    description: 'Create an interactive learning activity',
    prompt: 'Help me design a meaningful interactive learning activity for my current module.',
    icon: 'puzzle',
    phase: 'development',
  },
  {
    id: 'analyze-materials',
    label: 'Analyze Materials',
    description: 'Analyze uploaded source materials',
    prompt: 'Analyze my uploaded source materials and suggest how to use them in the course.',
    icon: 'search',
    phase: 'analysis',
  },
  {
    id: 'accessibility-review',
    label: 'Accessibility Review',
    description: 'Review content for WCAG 2.2 AA compliance',
    prompt: 'Review my current content for WCAG 2.2 AA accessibility compliance.',
    icon: 'eye',
    phase: 'evaluation',
  },
  {
    id: 'course-outline',
    label: 'Course Outline',
    description: 'Generate a structured course outline',
    prompt: 'Help me create a detailed course outline with modules and lessons.',
    icon: 'list',
    phase: 'design',
  },
  {
    id: 'facilitator-guide',
    label: 'Facilitator Guide',
    description: 'Create an instructor facilitator guide',
    prompt: 'Help me create a facilitator guide for my course.',
    icon: 'book',
    phase: 'implementation',
  },
];

// ══════════════════════════════════════════════════════
// FEATURE 1: NEEDS ANALYSIS WIZARD
// ══════════════════════════════════════════════════════

export type AnalysisArea =
  | 'performance-gap'
  | 'root-cause'
  | 'audience'
  | 'context-constraints'
  | 'success-metrics'
  | 'business-impact'
  | 'multimodal'
  | 'accessibility';

export const ANALYSIS_AREAS: { key: AnalysisArea; label: string; description: string; icon: string }[] = [
  { key: 'performance-gap', label: 'Performance Gap', description: 'Current vs desired state', icon: 'gap' },
  { key: 'root-cause', label: 'Root Cause', description: 'Is this really a training problem?', icon: 'search' },
  { key: 'audience', label: 'Audience Analysis', description: 'Learner characteristics, prerequisites, ZPD', icon: 'users' },
  { key: 'context-constraints', label: 'Context & Constraints', description: 'Environment, timeline, budget', icon: 'settings' },
  { key: 'success-metrics', label: 'Success Metrics', description: 'Measuring effectiveness', icon: 'chart' },
  { key: 'business-impact', label: 'Business Impact', description: 'Organizational problem being solved', icon: 'building' },
  { key: 'multimodal', label: 'Multimodal Requirements', description: 'Delivery constraints, learner preferences', icon: 'layers' },
  { key: 'accessibility', label: 'Accessibility', description: 'WCAG level, assistive technology', icon: 'accessibility' },
];

export interface AnalysisQuestion {
  id: string;
  area: AnalysisArea;
  question: string;
  followUpHint?: string;
  required: boolean;
}

export interface AnalysisResponse {
  questionId: string;
  area: AnalysisArea;
  question: string;
  answer: string;
  timestamp: string;
}

export interface AnalysisRedFlag {
  id: string;
  severity: 'warning' | 'critical';
  area: AnalysisArea;
  message: string;
  recommendation: string;
}

export interface NeedsAnalysisReport {
  id: string;
  projectId: string;
  executiveSummary: string;
  performanceGap: { currentState: string; desiredState: string; evidence: string[] };
  learnerProfile: {
    demographics: string;
    priorKnowledge: string;
    motivation: string;
    zpdAssessment: string;
    prerequisites: string[];
  };
  rootCauseAnalysis: { isTrainingAppropriate: boolean; reasoning: string; alternativeSolutions: string[] };
  constraints: { timeline: string; budget: string; technology: string; environment: string; stakeholders: string[] };
  multimodalRecommendations: { primaryModality: string; secondaryModalities: string[]; rationale: string };
  accessibilityRequirements: { wcagLevel: string; assistiveTech: string[]; considerations: string[] };
  successMetrics: { metric: string; measurement: string; target: string }[];
  businessImpact: { problem: string; costOfInaction: string; expectedROI: string };
  recommendation: {
    format: CourseType;
    duration: string;
    deliveryMethod: string;
    rationale: string;
  };
  materialReferences: string[];
  materialGaps: string[];
  redFlags: AnalysisRedFlag[];
  createdAt: string;
  enduringUnderstandings?: string[];
  essentialQuestions?: string[];
}

export type AnalysisWizardStatus = 'not-started' | 'in-progress' | 'completed';

export interface AnalysisWizardState {
  status: AnalysisWizardStatus;
  currentArea: AnalysisArea;
  completedAreas: AnalysisArea[];
  responses: AnalysisResponse[];
  report?: NeedsAnalysisReport;
}

// ══════════════════════════════════════════════════════
// FEATURE 2: COURSE OUTLINE BUILDER
// ══════════════════════════════════════════════════════

export type VARKModality = 'visual' | 'auditory' | 'readWrite' | 'kinesthetic';

export const VARK_MODALITIES: { key: VARKModality; label: string; short: string; color: string }[] = [
  { key: 'visual', label: 'Visual', short: 'V', color: 'bg-blue-100 text-blue-800' },
  { key: 'auditory', label: 'Auditory', short: 'A', color: 'bg-purple-100 text-purple-800' },
  { key: 'readWrite', label: 'Read/Write', short: 'R', color: 'bg-green-100 text-green-800' },
  { key: 'kinesthetic', label: 'Kinesthetic', short: 'K', color: 'bg-orange-100 text-orange-800' },
];

export type ZPDLevel = 'comfort' | 'learning' | 'frustration';

export interface LearningObjective {
  id: string;
  text: string;
  bloomLevel: BloomLevel;
  assessmentAligned: boolean;
  materialRefs: string[];
}

export interface MerrillBeatAnnotation {
  phase: 'activation' | 'demonstration' | 'application' | 'integration';
  notes: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  objectives: LearningObjective[];
  modalities: VARKModality[];
  zpdLevel: ZPDLevel;
  activities: string[];
  assessmentType?: string;
  materialRefs: string[];
  accessibilityNotes: string[];
  order: number;
  merrillBeats?: MerrillBeatAnnotation[];
  gagneBeats?: { beat: 'opener' | 'core' | 'practice' | 'close'; notes: string }[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  lessons: LessonPlan[];
  objectives: LearningObjective[];
  assessmentStrategy: string;
  modalities: VARKModality[];
  materialRefs: string[];
  order: number;
  collapsed?: boolean;
}

export interface CourseOutline {
  id: string;
  projectId: string;
  courseGoal: string;
  totalDuration: number;
  modules: CourseModule[];
  bloomDistribution: Record<BloomLevel, number>;
  varkCoverage: Record<VARKModality, number>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ══════════════════════════════════════════════════════
// FEATURE 3: DESIGN DOCUMENT GENERATOR
// ══════════════════════════════════════════════════════

export type DesignDocFormat = 'ilt-slides' | 'elearning' | 'video-script' | 'job-aid' | 'facilitator-guide';

export const DESIGN_DOC_FORMATS: { key: DesignDocFormat; label: string }[] = [
  { key: 'ilt-slides', label: 'ILT Slides' },
  { key: 'elearning', label: 'E-Learning Module' },
  { key: 'video-script', label: 'Video Script' },
  { key: 'job-aid', label: 'Job Aid' },
  { key: 'facilitator-guide', label: 'Facilitator Guide' },
];

export interface LearnerViewContent {
  heading: string;
  bodyText: string;
  bulletPoints: string[];
  interactionDescription: string;
  visualDescription: string;
  audioScript: string;
  accessibilityFeatures: string[];
}

export interface DesignNotesContent {
  instructionalRationale: string;
  multimodalStrategy: string;
  interactivitySpec: string;
  developmentNotes: string;
  smeReviewFlag: boolean;
  smeReviewNotes: string;
  accessibilityNotes: string;
  branchingLogic: string;
  assessmentScoring: string;
  scaffoldingStrategy: string;
  assetRequirements: string[];
  materialRefs: string[];
  zpdLevel: ZPDLevel;
  bloomLevel: BloomLevel;
  arcsBeats?: { component: 'attention' | 'relevance' | 'confidence' | 'satisfaction'; notes: string }[];
  cognitiveLoadNotes?: string;
  multimediaPrincipleRefs?: string[];
}

export interface DesignDocSlide {
  id: string;
  slideNumber: number;
  title: string;
  objectiveRef: string;
  learnerView: LearnerViewContent;
  designNotes: DesignNotesContent;
}

export interface DesignDocument {
  id: string;
  projectId: string;
  moduleId: string;
  lessonId?: string;
  format: DesignDocFormat;
  title: string;
  slides: DesignDocSlide[];
  bloomDistribution: Record<BloomLevel, number>;
  varkCoverage: Record<VARKModality, number>;
  interactivityScore: number; // 0-100
  accessibilityCompliance: number; // 0-100
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════════════
// FEATURE 4: QUALITY ASSURANCE TOOLS
// ══════════════════════════════════════════════════════

export type QAToolType =
  | 'alignment'
  | 'blooms'
  | 'multimodal'
  | 'zpd'
  | 'interactivity'
  | 'accessibility'
  | 'style-guide'
  | 'gap-analysis'
  | 'source-material';

export const QA_TOOLS: { key: QAToolType; label: string; description: string; icon: string }[] = [
  { key: 'alignment', label: 'Alignment Checker', description: 'Verify assessments match learning objectives', icon: 'link' },
  { key: 'blooms', label: "Bloom's Analyzer", description: 'Ensure appropriate cognitive levels throughout', icon: 'layers' },
  { key: 'multimodal', label: 'Multimodal Coverage', description: 'Check VARK distribution across course', icon: 'grid' },
  { key: 'zpd', label: 'ZPD Validator', description: 'Assess if content targets learner ZPD', icon: 'target' },
  { key: 'interactivity', label: 'Interactivity Checker', description: 'Detect fake interactivity and score meaningfulness', icon: 'zap' },
  { key: 'accessibility', label: 'Accessibility Validator', description: 'WCAG 2.0/2.1 AA plus 2.2 additions: focus appearance, target size, dragging alternatives, redundant entry', icon: 'eye' },
  { key: 'style-guide', label: 'Style Guide Enforcer', description: 'Check content against writing standards', icon: 'type' },
  { key: 'gap-analysis', label: 'Gap Analysis', description: 'Identify missing components and weak areas', icon: 'search' },
  { key: 'source-material', label: 'Source Material Audit', description: 'Track material usage and coverage', icon: 'folder' },
];

export type QASeverity = 'critical' | 'warning' | 'info' | 'pass';

export interface QAFinding {
  id: string;
  tool: QAToolType;
  severity: QASeverity;
  title: string;
  description: string;
  location: string;
  suggestion: string;
  resolved: boolean;
}

export interface QAReport {
  id: string;
  projectId: string;
  tool: QAToolType;
  score: number; // 0-100
  findings: QAFinding[];
  summary: string;
  runAt: string;
}

export type StyleGuideType = 'built-in' | 'pdf-upload' | 'custom';

export type StyleRuleCategory =
  | 'voice'
  | 'terminology'
  | 'formatting'
  | 'structure'
  | 'tone'
  | 'capitalization'
  | 'punctuation'
  | 'ui-elements'
  | 'spelling'
  | 'forbidden-phrases';

export interface StyleRule {
  id: string;
  category: StyleRuleCategory;
  rule: string;
  example?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface StyleGuide {
  id: string;
  name: string;
  version: string;
  description: string;
  type: StyleGuideType;
  rules: StyleRule[];
  source?: string;
  uploadedAt?: string;
  pdfFileName?: string;
  pdfContent?: string;
}

export const DEFAULT_STYLE_RULES: StyleRule[] = [
  // Voice
  { id: 'dflt-v1', category: 'voice', rule: 'Use active voice instead of passive voice', example: '"The manager approves the request" not "The request is approved by the manager"', severity: 'warning' },
  { id: 'dflt-v2', category: 'voice', rule: 'Use second person (you/your) to address the learner directly', example: '"You can configure settings" not "Users can configure settings"', severity: 'info' },
  { id: 'dflt-v3', category: 'voice', rule: 'Avoid double negatives', example: '"You can" instead of "You cannot not"', severity: 'warning' },

  // Tone
  { id: 'dflt-t1', category: 'tone', rule: 'Write in a conversational but professional tone, the way you talk', example: 'Use everyday words and contractions. Avoid overly formal or stiff language.', severity: 'info' },
  { id: 'dflt-t2', category: 'tone', rule: 'Avoid gendered pronouns. Use "they/them" or rewrite the sentence', severity: 'warning' },
  { id: 'dflt-t3', category: 'tone', rule: 'Avoid culturally specific idioms that might not translate', severity: 'info' },
  { id: 'dflt-t4', category: 'tone', rule: 'Use person-first language when discussing disabilities', severity: 'warning' },

  // Terminology
  { id: 'dflt-tm1', category: 'terminology', rule: 'Use consistent terminology throughout. Pick one term for a concept and stick with it.', severity: 'warning' },
  { id: 'dflt-tm2', category: 'terminology', rule: 'Define jargon and technical terms on first use', severity: 'warning' },
  { id: 'dflt-tm3', category: 'terminology', rule: 'No Latin abbreviations. Write "for example" not "e.g.", "that is" not "i.e."', example: 'Exception: "etc." is acceptable only where space is genuinely limited.', severity: 'error' },
  { id: 'dflt-tm4', category: 'terminology', rule: 'Use contractions naturally (it\'s, you\'re, don\'t). Never form noun + verb contractions.', example: 'Incorrect: "Google\'s developing..." Correct: "Google is developing..."', severity: 'info' },
  { id: 'dflt-tm5', category: 'terminology', rule: 'Avoid awkward contractions: there\'d, it\'ll, they\'d, she\'d, he\'d. Use the full form.', severity: 'info' },
  { id: 'dflt-tm6', category: 'terminology', rule: 'Use "might" for possibility, "may" for permission only', example: '"You might need to restart" not "You may need to restart"', severity: 'error' },
  { id: 'dflt-tm7', category: 'terminology', rule: 'Use "sign in" and "sign out" only. Never "log in," "log on," "log off," or variants.', severity: 'error' },
  { id: 'dflt-tm8', category: 'terminology', rule: 'Do not use "and so on," "etc.," or vague list endings. Be specific.', example: 'Use "such as" followed by concrete examples.', severity: 'warning' },
  { id: 'dflt-tm9', category: 'terminology', rule: 'Do not use non-English words or phrases (de facto, ad hoc, per se, vis-a-vis)', severity: 'warning' },

  // Capitalization
  { id: 'dflt-c1', category: 'capitalization', rule: 'Use sentence-style capitalization for all headings and labels', example: '"Set up your account" not "Set Up Your Account"', severity: 'error' },
  { id: 'dflt-c2', category: 'capitalization', rule: 'Capitalize proper nouns, brand names, product names, course titles, and job titles', example: 'Project Manager, Account Executive', severity: 'warning' },
  { id: 'dflt-c4', category: 'capitalization', rule: 'Capitalize the first word after a colon in titles, headings, Tip/Note/Caution labels, and definition lists', example: 'Note: You will almost always be working with an existing dispatch rule.', severity: 'info' },

  // Punctuation
  { id: 'dflt-p1', category: 'punctuation', rule: 'Do not use ampersands (&) in place of "and" in text or headings', example: '"Settings and preferences" not "Settings & preferences"', severity: 'error' },
  { id: 'dflt-p2', category: 'punctuation', rule: 'Do not use slashes to mean "or." Write "or" in text.', example: '"Choose a product or service" not "Choose a product/service"', severity: 'error' },
  { id: 'dflt-p3', category: 'punctuation', rule: 'Do not use "and/or" unless it avoids lengthy wording. In most cases, "or" on its own is sufficient.', severity: 'warning' },
  { id: 'dflt-p4', category: 'punctuation', rule: 'Include a colon at the end of a phrase that directly introduces a list', severity: 'info' },

  // Formatting
  { id: 'dflt-f1', category: 'formatting', rule: 'Bold UI elements only inside numbered procedure steps, not in paragraph text', example: '1. Click **Settings** > **Add user**. (In paragraph text, do not bold.)', severity: 'error' },
  { id: 'dflt-f2', category: 'formatting', rule: 'In definition-style lists, bold the term followed by a colon', example: '- **Vertical:** Displays data in a vertical format.', severity: 'info' },
  { id: 'dflt-f3', category: 'formatting', rule: 'Use numbered lists for sequential steps, bulleted lists for non-sequential items', severity: 'info' },
  { id: 'dflt-f4', category: 'formatting', rule: 'Bold tips and notes in ILT PowerPoint so learners can scan slide content', severity: 'info' },

  // UI Elements
  { id: 'dflt-ui1', category: 'ui-elements', rule: 'Match the exact spelling and capitalization the learner sees in the product interface', severity: 'warning' },
  { id: 'dflt-ui2', category: 'ui-elements', rule: 'If the UI displays ALL CAPS text, write it in title case or sentence case instead', severity: 'info' },
  { id: 'dflt-ui3', category: 'ui-elements', rule: '"OK" is always written as OK (both letters capitalized), regardless of UI display', severity: 'info' },

  // Spelling
  { id: 'dflt-sp1', category: 'spelling', rule: 'Use US spelling throughout (license, color, center, analyze, recognize, behavior)', example: 'Not: licence, colour, centre, analyse, recognise, behaviour', severity: 'error' },

  // Structure
  { id: 'dflt-s1', category: 'structure', rule: 'Keep sentences short. Aim for 25 words or fewer.', severity: 'warning' },
  { id: 'dflt-s2', category: 'structure', rule: 'Keep paragraphs to 3-5 sentences maximum', severity: 'info' },
  { id: 'dflt-s3', category: 'structure', rule: 'Lead with the most important information first', severity: 'info' },
  { id: 'dflt-s4', category: 'structure', rule: 'Use proper heading hierarchy (H1 > H2 > H3). Never skip levels.', severity: 'error' },
  { id: 'dflt-s5', category: 'structure', rule: 'One idea per paragraph. Do not bundle multiple concepts together.', severity: 'info' },
  { id: 'dflt-s6', category: 'structure', rule: 'Link text should describe the destination: "View the certification guide" not "Click here."', severity: 'warning' },

  // Forbidden Phrases (Module 7 AI patterns)
  { id: 'dflt-fp1', category: 'forbidden-phrases', rule: 'Never use the phrase "in today\'s fast-paced world" or similar cliched openers', severity: 'error' },
  { id: 'dflt-fp2', category: 'forbidden-phrases', rule: 'Avoid "leverage" as a verb. Use "use," "apply," or a more specific verb.', example: '"Use the planning tool" not "Leverage the planning tool"', severity: 'warning' },
  { id: 'dflt-fp3', category: 'forbidden-phrases', rule: 'Avoid "delve" and "delve into." Use "explore," "examine," or "look at."', severity: 'warning' },
  { id: 'dflt-fp4', category: 'forbidden-phrases', rule: 'Do not use "Imagine you\'re a manager" or similar hypothetical role-play openers. Use real scenario framing.', example: '"A project manager receives two conflicting status reports..." not "Imagine you\'re a manager..."', severity: 'warning' },
  { id: 'dflt-fp5', category: 'forbidden-phrases', rule: 'Avoid "It is important to note" and similar throat-clearing. State the point directly.', severity: 'warning' },
  { id: 'dflt-fp6', category: 'forbidden-phrases', rule: 'Avoid "utilize." Use "use."', severity: 'info' },
  { id: 'dflt-fp7', category: 'forbidden-phrases', rule: 'Avoid "in order to." Use "to."', severity: 'info' },
  { id: 'dflt-fp8', category: 'forbidden-phrases', rule: 'Avoid "at the end of the day" and similar filler phrases.', severity: 'info' },
];

export const DEFAULT_STYLE_GUIDE: StyleGuide = {
  id: 'built-in-plain-language-v1',
  name: 'Plain-language style guide',
  version: '1.0',
  description: 'The default writing and formatting standards that ship with the app. Covers tone, terminology, capitalization, punctuation, formatting, UI elements, US spelling, and forbidden phrases.',
  type: 'built-in',
  rules: DEFAULT_STYLE_RULES,
  source: 'style-guides/default/style-guide.md',
};

export function getActiveStyleGuide(): StyleGuide {
  return DEFAULT_STYLE_GUIDE;
}

// ══════════════════════════════════════════════════════
// FEATURE 5: DEVELOPMENT SUPPORT TOOLS
// ══════════════════════════════════════════════════════

// ── Assessment Generator ──

export type AssessmentQuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'matching'
  | 'short-answer'
  | 'essay'
  | 'scenario-based'
  | 'ordering';

export const ASSESSMENT_QUESTION_TYPES: { key: AssessmentQuestionType; label: string; bloomLevels: BloomLevel[] }[] = [
  { key: 'multiple-choice', label: 'Multiple Choice', bloomLevels: ['remember', 'understand'] },
  { key: 'true-false', label: 'True / False', bloomLevels: ['remember', 'understand'] },
  { key: 'matching', label: 'Matching', bloomLevels: ['remember', 'understand'] },
  { key: 'short-answer', label: 'Short Answer', bloomLevels: ['remember', 'understand', 'apply'] },
  { key: 'essay', label: 'Essay / Open Response', bloomLevels: ['evaluate', 'create'] },
  { key: 'scenario-based', label: 'Scenario-Based', bloomLevels: ['apply', 'analyze', 'evaluate'] },
  { key: 'ordering', label: 'Ordering / Sequencing', bloomLevels: ['understand', 'apply'] },
];

export type QuestionDifficulty = 'foundational' | 'intermediate' | 'advanced';

export interface AnswerChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  prompt: string;
  match: string;
}

export interface AssessmentQuestion {
  id: string;
  type: AssessmentQuestionType;
  topic: string;
  bloomLevel: BloomLevel;
  difficulty: QuestionDifficulty;
  stem: string;
  scenario?: string;
  choices?: AnswerChoice[];
  matchingPairs?: MatchingPair[];
  orderItems?: string[];
  correctAnswer?: string;
  rubricPoints?: string[];
  objectiveRef?: string;
  explanation: string;
  estimatedTime: number; // minutes
  tags: string[];
  distractorRationales?: Record<string, string>;
  haladynaChecks?: string[];
}

export interface BlueprintModule {
  moduleId: string;
  moduleTitle: string;
  questionCount: number;
  bloomTargets: BloomLevel[];
}

export interface AssessmentBlueprint {
  id: string;
  projectId: string;
  title: string;
  totalQuestions: number;
  modules: BlueprintModule[];
  questionTypeDistribution: Partial<Record<AssessmentQuestionType, number>>;
  bloomDistribution: Partial<Record<BloomLevel, number>>;
  estimatedDuration: number;
  questions: AssessmentQuestion[];
  createdAt: string;
}

// ── Rubric Builder ──

export interface RubricLevel {
  id: string;
  label: string;
  points: number;
  descriptor: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage (all criteria weights sum to 100)
  levels: RubricLevel[];
}

export interface GeneratedRubric {
  id: string;
  projectId: string;
  title: string;
  assessmentType: string;
  bloomLevel: BloomLevel;
  totalPoints: number;
  criteria: RubricCriterion[];
  objectiveRef?: string;
  createdAt: string;
}

// ── Learner Persona Generator ──

export type ExperienceLevel = 'novice' | 'intermediate' | 'expert';
export type TechComfortLevel = 'low' | 'medium' | 'high';

export interface LearnerPersona {
  id: string;
  projectId: string;
  name: string;
  role: string;
  ageRange: string;
  experienceLevel: ExperienceLevel;
  background: string;
  goals: string[];
  challenges: string[];
  learningPreferences: VARKModality[];
  techComfort: TechComfortLevel;
  motivation: string;
  priorKnowledge: string;
  workContext: string;
  accessibilityNeeds: string;
  quote: string;
  zpdAssessment: string;
  createdAt: string;
  intrinsicMotivation?: string;
  extrinsicMotivation?: string;
}

// ── Facilitator Guide Generator ──

export interface FacilitatorGuideSection {
  id: string;
  title: string;
  duration: number;
  objectives: string[];
  facilitatorNotes: string;
  activities: string[];
  discussionPrompts: string[];
  materials: string[];
  transitionNote: string;
  timingTips: string;
  arcsBeats?: { component: 'attention' | 'relevance' | 'confidence' | 'satisfaction'; notes: string }[];
  psychologicalSafetyNotes?: string;
}

export interface FacilitatorGuide {
  id: string;
  projectId: string;
  courseTitle: string;
  audience: string;
  prerequisites: string;
  roomSetup: string;
  techRequirements: string;
  totalDuration: number;
  sections: FacilitatorGuideSection[];
  createdAt: string;
}

// ── Quick Generate ──

export type QuickGenerateType =
  | 'objectives'
  | 'questions'
  | 'discussion-prompts'
  | 'reflection-questions'
  | 'case-study'
  | 'job-aid'
  | 'activity-instructions';

export interface QuickGenerateResult {
  id: string;
  projectId: string;
  type: QuickGenerateType;
  topic: string;
  bloomLevel?: BloomLevel;
  content: string; // markdown-formatted output
  createdAt: string;
}

// ── Active Dev Tool ──

export type DevToolType =
  | 'assessment-gen'
  | 'blueprint'
  | 'persona-gen'
  | 'rubric-builder'
  | 'facilitator-guide'
  | 'quick-generate';

export const DEV_TOOLS: { key: DevToolType; label: string; description: string; icon: string; phase: ADDIEPhase }[] = [
  { key: 'assessment-gen', label: 'Assessment Generator', description: 'Generate all question types: MC, T/F, scenario-based, essay', icon: 'clipboard', phase: 'development' },
  { key: 'blueprint', label: 'Assessment Blueprint', description: 'Build a complete assessment plan across modules', icon: 'map', phase: 'design' },
  { key: 'persona-gen', label: 'Learner Personas', description: 'Create rich learner personas for your target audience', icon: 'users', phase: 'analysis' },
  { key: 'rubric-builder', label: 'Rubric Builder', description: 'Create scoring rubrics for subjective assessments', icon: 'grid', phase: 'development' },
  { key: 'facilitator-guide', label: 'Facilitator Guide', description: 'Draft instructor guides with timing and activities', icon: 'book', phase: 'implementation' },
  { key: 'quick-generate', label: 'Quick Generate', description: 'Fast tools: objectives, discussion prompts, job aids', icon: 'zap', phase: 'development' },
];

// ══════════════════════════════════════════════════════
// SETTINGS, TEMPLATES & PROMPT SHORTCUTS
// ══════════════════════════════════════════════════════

export interface UserSettings {
  displayName: string;
  defaultCourseType: CourseType;
  defaultBloomTarget: BloomLevel;
  autoSave: boolean;
  showWordCount: boolean;
  showBloomsDistribution: boolean;
  claudeMdContent: string;
}

export interface PromptShortcut {
  id: string;
  label: string;
  prompt: string;
  category: 'analysis' | 'outline' | 'design' | 'assessment' | 'general';
  icon: string;
  isBuiltIn: boolean;
  createdAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'module' | 'lesson' | 'assessment' | 'activity' | 'objective';
  courseType: CourseType;
  template: string;
  variables: string[];
  tags: string[];
  isBuiltIn: boolean;
  createdAt: string;
}
