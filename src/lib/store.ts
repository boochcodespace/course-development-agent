'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project,
  ChatMessage,
  Material,
  MaterialCollection,
  Tag,
  ADDIEPhase,
  CourseType,
  AnalysisArea,
  AnalysisResponse,
  AnalysisWizardState,
  AnalysisWizardStatus,
  NeedsAnalysisReport,
  AnalysisRedFlag,
  CourseOutline,
  CourseModule,
  LessonPlan,
  LearningObjective,
  BloomLevel,
  VARKModality,
  ZPDLevel,
  DesignDocument,
  DesignDocFormat,
  DesignDocSlide,
  QAReport,
  QAFinding,
  QAToolType,
  StyleGuide,
  AssessmentQuestion,
  AssessmentBlueprint,
  GeneratedRubric,
  LearnerPersona,
  FacilitatorGuide,
  QuickGenerateResult,
  DevToolType,
  UserSettings,
  PromptShortcut,
  ContentTemplate,
  StageId,
  StageStatus,
  ProjectStage,
  StageArtifactVersion,
  createInitialStages,
  normalizeStages,
} from './types';
import { generateId } from './utils';

const DEFAULT_CLAUDE_MD = `# AI Course Development Agent — Knowledge Base

This file is the persistent knowledge base for the AI-powered course development agent.
It encodes the instructional design principles, frameworks, standards, and best practices
that guide every phase of the course development lifecycle.

## Output Contract: Developer Handoff Artifacts

This application produces scaffolded developer handoff artifacts, not finished learner-facing content.
All generators produce outlines, design documents, assessment blueprints, rubrics, facilitator guides,
and personas that a course developer will then build in Rise 360, PowerPoint, Captivate, or similar
authoring tools. The output is structured, annotated scaffolding for instructional designers and developers.

## Agent Skills and Style Standards

### Pre-Flight Planning: The Interviewer
Any time a creation task is requested, run the Interviewer workflow first (/the-interviewer).
Interview before you build. Scan workspace context, propose a full spec, ask 2-8 targeted questions,
then present a brief for approval before any content is created.

### Style guide
All content must conform to the active style guide. Choose it in Settings. Guides live in the
style-guides folder: the plain-language default ships with the app, and your own guides go in
style-guides/custom. Apply the guide silently. Do not narrate the rules in the output.

## ADDIE Methodology
Every course follows Analysis, Design, Development, Implementation, Evaluation.
Never skip Analysis. Designing without understanding the audience produces ineffective content.

## Bloom's Taxonomy (Revised)
Remember, Understand, Apply, Analyze, Evaluate, Create.
Target Apply or above for professional training.

## Adult Learning Principles (Andragogy)
1. Self-directed: Adults want control over their learning path
2. Experience-based: Build on prior knowledge
3. Relevance-oriented: Connect every concept to real-world application
4. Problem-centered: Use case studies and scenarios
5. Internally motivated: Mastery, autonomy, purpose
6. Respectful: Honor the learner's time and intelligence

## Multimodal Learning (VARK)
Visual, Auditory, Read/Write, Kinesthetic.
Include 2-3 modalities per module. Lead with the modality that best fits the content type.

## Zone of Proximal Development (ZPD)
Three zones: Comfort (below ZPD), Learning (target this), Frustration (beyond ZPD).
Scaffolding: worked examples, partial completion, hints, checklists, chunking.
Follow "I do, We do, You do" (Gradual Release of Responsibility).

## Meaningful Interactivity
Every interaction must: have decisions with real consequences, provide explanatory feedback,
include scenario branching, and reflect real-world ambiguity.
Avoid fake interactivity: clicking Next, cosmetic drag-and-drop, hidden accordions.

## Accessibility (WCAG 2.2 AA)
POUR: Perceivable, Operable, Understandable, Robust.
Alt text, captions, 4.5:1 contrast, keyboard accessible, semantic HTML.
Added in 2.2: focus appearance, target size (24x24px min), dragging movements alternatives,
accessible authentication (no cognitive function tests).

## Assessment Principles
Formative throughout. Summative at milestones.
MC best practices: clear stem, plausible distractors, 4 options, no "all/none of the above."
Answer keys must explain why each answer is correct or incorrect.
Align every question to a learning objective and Bloom's level.
`;

const DEFAULT_PROMPT_SHORTCUTS: PromptShortcut[] = [
  { id: 'ps-1', label: 'Generate learning objectives', prompt: 'Generate 5 SMART learning objectives using Bloom\'s Taxonomy for this topic. Target the Apply level or above. Use the formula: "By the end of this module, you will be able to [verb] + [object] + [condition]." Follow the active style guide', category: 'outline', icon: '🎯', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-2', label: 'Write scenario-based question', prompt: 'Write a scenario-based assessment item that tests application-level thinking. Include: a realistic workplace scenario (not "Imagine you\'re a manager"), a decision point, 4 answer choices (A through D) with one clearly correct, and explanations for why each choice is right or wrong. Follow the active style guide.', category: 'assessment', icon: '📝', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-3', label: 'Create case study', prompt: 'Create a realistic case study for this topic. Include: background context, key challenge or problem, relevant data or information, and 3-4 discussion questions that progress from Understand to Evaluate on Bloom\'s scale. Use real scenario framing, not hypothetical role-play openers. Follow the active style guide.', category: 'design', icon: '📋', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-4', label: 'WCAG 2.2 AA accessibility review', prompt: 'Review this content against WCAG 2.2 Level AA standards. Check: alt text for images, caption availability, color contrast ratios (4.5:1 minimum), keyboard accessibility, reading level, heading structure (no skipped levels), link descriptiveness, focus appearance, target size (24x24px minimum), and accessible authentication. Flag any issues with specific WCAG success criteria references.', category: 'general', icon: '♿', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-5', label: 'Suggest VARK activities', prompt: 'Suggest one learning activity for each VARK modality (Visual, Auditory, Read/Write, Kinesthetic) for this topic. Each activity should be meaningfully different, not just the same content in a different format. Label each activity with its primary modality.', category: 'design', icon: '🎨', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-6', label: "Check Bloom's alignment", prompt: 'Review the learning objectives and assessments for this module. Verify: each objective uses a measurable action verb, each assessment aligns to exactly one objective, the Bloom\'s level of the assessment matches the objective, and there are no unassessed objectives. Flag any verb drift (for example, an objective that says "analyze" but the assessment only tests recall).', category: 'assessment', icon: '🔗', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ps-7', label: 'Style guide review', prompt: 'Review this content against the active style guide. For each issue, quote the passage, name the rule it breaks, and give a corrected version. Group findings as Critical, Recommended, and Style guide gaps (anything the guide does not cover that you had to decide).', category: 'general', icon: '📐', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z' },
];

const DEFAULT_CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'ct-1', name: 'Module introduction', description: 'Standard opening scaffold for a course module',
    category: 'module', courseType: 'self-paced', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z',
    variables: ['MODULE_TITLE', 'DURATION', 'OBJECTIVE_COUNT', 'PREREQUISITE'],
    tags: ['introduction', 'module'],
    template: `# {{MODULE_TITLE}}\n\nDuration: {{DURATION}} minutes\nPrerequisites: {{PREREQUISITE}}\n\n## What you'll learn\nIn this module, you'll...\n\n## Learning objectives\nBy the end of this module, you'll be able to:\n1. [Objective 1]\n2. [Objective 2]\n3. [Objective 3]\n\n## Why this matters\n[Connect to job performance and real-world application]\n\n## How to navigate this module\n[Navigation instructions for the authoring tool]`,
  },
  {
    id: 'ct-2', name: 'Learning objective', description: 'SMART objective using Bloom\'s formula',
    category: 'objective', courseType: 'self-paced', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z',
    variables: ['BLOOM_VERB', 'OBJECT', 'CONDITION', 'CRITERIA'],
    tags: ['objective', 'bloom'],
    template: `By the end of this {{CONTEXT}}, you'll be able to:\n{{BLOOM_VERB}} {{OBJECT}} {{CONDITION}} {{CRITERIA}}.`,
  },
  {
    id: 'ct-3', name: 'Scenario-based question', description: 'Application-level assessment item scaffold',
    category: 'assessment', courseType: 'self-paced', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z',
    variables: ['ROLE', 'SITUATION', 'CHALLENGE', 'CORRECT_ACTION', 'DISTRACTOR_1', 'DISTRACTOR_2', 'DISTRACTOR_3'],
    tags: ['assessment', 'scenario', 'apply'],
    template: `Scenario: A {{ROLE}} encounters {{SITUATION}}. {{CHALLENGE}}\n\nWhat should the {{ROLE}} do?\n\nA. {{CORRECT_ACTION}}\nB. {{DISTRACTOR_1}}\nC. {{DISTRACTOR_2}}\nD. {{DISTRACTOR_3}}\n\nCorrect answer: A\nExplanation: Option A is correct because...\nWhy B is wrong: ...\nWhy C is wrong: ...\nWhy D is wrong: ...`,
  },
  {
    id: 'ct-4', name: 'ILT activity', description: 'Instructor-led group activity scaffold',
    category: 'activity', courseType: 'ilt', isBuiltIn: true, createdAt: '2026-01-01T00:00:00Z',
    variables: ['ACTIVITY_NAME', 'DURATION', 'GROUP_SIZE', 'OBJECTIVE', 'MATERIALS'],
    tags: ['ilt', 'activity', 'group'],
    template: `## {{ACTIVITY_NAME}}\n\nDuration: {{DURATION}} minutes\nGroup size: {{GROUP_SIZE}}\nMaterials: {{MATERIALS}}\n\n### Facilitator instructions\n1. Introduce the activity (2 min)\n2. [Step 2]\n3. [Step 3]\n\n### Debrief questions\n- What did you notice?\n- How does this connect to {{OBJECTIVE}}?\n- What would you do differently?`,
  },
];

// ── Sample Data ──

const sampleProject: Project = {
  id: 'project-1',
  title: 'New manager essentials',
  description: 'A self-paced e-learning course for first-time people managers covering one-on-ones, feedback, delegation, and team communication.',
  courseType: 'self-paced',
  targetAudience: 'First-time people managers with strong individual-contributor experience but no formal management training',
  industry: 'Professional services',
  status: 'active',
  currentPhase: 'design',
  phaseProgress: {
    analysis: 100,
    design: 45,
    development: 0,
    implementation: 0,
    evaluation: 0,
  },
  tags: ['management', 'onboarding', 'self-paced'],
  stages: createInitialStages(),
  projectNotes: [],
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-15T14:30:00Z',
};

const sampleProject2: Project = {
  id: 'project-2',
  title: 'Project management certification prep',
  description: 'A certification preparation course for project managers covering planning, risk management, stakeholder communication, and exam strategy.',
  courseType: 'blended',
  targetAudience: 'Practicing project managers preparing for a professional certification exam',
  industry: 'Professional services',
  status: 'active',
  currentPhase: 'analysis',
  phaseProgress: {
    analysis: 60,
    design: 0,
    development: 0,
    implementation: 0,
    evaluation: 0,
  },
  tags: ['certification', 'project-management', 'blended'],
  stages: createInitialStages(),
  projectNotes: [],
  createdAt: '2026-02-10T09:00:00Z',
  updatedAt: '2026-02-14T11:00:00Z',
};

const sampleMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    projectId: 'project-1',
    role: 'assistant',
    content: `Welcome to the New manager essentials project. I'm your course development agent.

I've reviewed the analysis phase. Here's where things stand:

Analysis phase: Complete
- Target audience: First-time people managers
- Key need: Build foundational skills in one-on-ones, feedback, and delegation
- Delivery: Self-paced e-learning
- Duration: 6-module course, approximately 4 hours total

Design phase: In progress (45%)
- Course outline drafted
- Learning objectives for Module 1 complete
- Still needed: Objectives for Modules 2-4, assessment strategy

What would you like to work on next? I'd suggest we continue with the learning objectives for Module 2: Giving feedback.`,
    timestamp: '2026-02-15T14:30:00Z',
  },
];

const sampleMaterial: Material = {
  id: 'mat-1',
  name: 'New manager handbook',
  originalName: 'new-manager-handbook.pdf',
  type: 'pdf',
  category: 'reference',
  size: 2457600,
  mimeType: 'application/pdf',
  tags: ['management', 'reference'],
  notes: 'Internal handbook for new managers. Key sections: One-on-ones (pp. 12-28), Giving feedback (pp. 29-45).',
  projectId: 'project-1',
  collectionIds: ['col-1'],
  analysis: {
    keyConcepts: ['one-on-one meetings', 'feedback models', 'delegation', 'team communication', 'goal setting'],
    suggestedObjectives: [
      'Plan a one-on-one meeting agenda that covers progress, obstacles, and development',
      'Explain the difference between feedback about behavior and feedback about personality',
      'Choose which tasks to delegate and which to keep, and justify the choice',
    ],
    bloomLevels: ['remember', 'understand', 'apply'],
    detectedStructure: ['Chapter 1: Your first 90 days', 'Chapter 2: One-on-ones', 'Chapter 3: Giving feedback', 'Chapter 4: Delegation'],
    readabilityLevel: 'Professional level (Flesch-Kincaid Grade 12)',
    contentGaps: ['No practical exercises or scenarios', 'Missing visual walkthroughs', 'No self-assessment opportunities'],
    glossaryTerms: [
      { term: 'one-on-one', definition: 'A recurring private meeting between a manager and a direct report' },
      { term: 'direct report', definition: 'A person who reports directly to a given manager' },
      { term: 'delegation', definition: 'Assigning ownership of a task or decision to someone else while keeping accountability for the outcome' },
    ],
    accessibilityIssues: ['PDF not tagged for screen readers', 'Some tables lack header associations'],
    summary: 'Comprehensive handbook covering core management practices. Strong on checklists but lacks instructional scaffolding. Recommend transforming into scenario-based learning with practical exercises.',
  },
  snippets: [],
  version: 1,
  uploadedAt: '2026-02-05T10:00:00Z',
  updatedAt: '2026-02-05T10:00:00Z',
  filePath: '/uploads/new-manager-handbook.pdf',
};

const sampleMaterial2: Material = {
  id: 'mat-2',
  name: 'Manager scenarios deck',
  originalName: 'manager-scenarios.pptx',
  type: 'pptx',
  category: 'sme-content',
  size: 8912000,
  mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tags: ['management', 'scenarios'],
  notes: 'SME-provided slides showing common first-year manager situations. 18 slides with decision points.',
  projectId: 'project-1',
  collectionIds: ['col-1'],
  snippets: [],
  version: 1,
  uploadedAt: '2026-02-06T14:00:00Z',
  updatedAt: '2026-02-06T14:00:00Z',
  filePath: '/uploads/manager-scenarios.pptx',
};

const sampleCollection: MaterialCollection = {
  id: 'col-1',
  name: 'Manager course source materials',
  description: 'All source materials for the New manager essentials course',
  materialIds: ['mat-1', 'mat-2'],
  createdAt: '2026-02-05T10:00:00Z',
};

// ── Store Types ──

interface AppState {
  // Navigation
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'chat' | 'materials' | 'settings' | 'analysis' | 'outline' | 'design-doc' | 'quality-assurance' | 'content-draft' | 'interactive-spec' | 'development' | 'knowledge-base';
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: AppState['activeView']) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'phaseProgress' | 'status' | 'stages' | 'projectNotes'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectNote: (projectId: string, note: string) => void;

  // Pipeline Stages
  getStage: (projectId: string, stageId: StageId) => ProjectStage | null;
  isStageAvailable: (projectId: string, stageId: StageId) => boolean;
  setStageStatus: (projectId: string, stageId: StageId, status: StageStatus) => void;
  setStageArtifact: (projectId: string, stageId: StageId, markdown: string, metadata?: Record<string, unknown>) => void;
  setStageArtifactFromChat: (projectId: string, stageId: StageId, newMarkdown: string, changeDescription: string) => void;
  commitStage: (projectId: string, stageId: StageId, artifactMarkdown: string, artifactMetadata: Record<string, unknown>, authorNote?: string) => void;
  unlockStage: (projectId: string, stageId: StageId) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  getProjectMessages: (projectId: string) => ChatMessage[];

  // Materials
  materials: Material[];
  collections: MaterialCollection[];
  selectedMaterialId: string | null;
  materialViewerOpen: boolean;
  setSelectedMaterial: (id: string | null) => void;
  setMaterialViewerOpen: (open: boolean) => void;
  addMaterial: (material: Omit<Material, 'id' | 'uploadedAt' | 'updatedAt' | 'snippets' | 'version'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addSnippet: (materialId: string, content: string, page?: number, note?: string) => void;
  addCollection: (name: string, description: string, materialIds: string[]) => MaterialCollection;

  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: {
    projects: Project[];
    materials: Material[];
  };
  performSearch: (query: string) => void;

  // ── Needs Analysis Wizard ──
  analysisWizards: Record<string, AnalysisWizardState>; // keyed by projectId
  getAnalysisWizard: (projectId: string) => AnalysisWizardState;
  startAnalysisWizard: (projectId: string) => void;
  setAnalysisArea: (projectId: string, area: AnalysisArea) => void;
  addAnalysisResponse: (projectId: string, response: Omit<AnalysisResponse, 'timestamp'>) => void;
  completeAnalysisArea: (projectId: string, area: AnalysisArea) => void;
  setAnalysisReport: (projectId: string, report: NeedsAnalysisReport) => void;
  completeAnalysisWizard: (projectId: string) => void;

  // ── Course Outline Builder ──
  courseOutlines: Record<string, CourseOutline>; // keyed by projectId
  getCourseOutline: (projectId: string) => CourseOutline | null;
  createCourseOutline: (projectId: string, courseGoal: string) => CourseOutline;
  updateCourseOutline: (projectId: string, updates: Partial<CourseOutline>) => void;
  addModule: (projectId: string, module: Omit<CourseModule, 'id' | 'order' | 'lessons'>) => CourseModule;
  updateModule: (projectId: string, moduleId: string, updates: Partial<CourseModule>) => void;
  removeModule: (projectId: string, moduleId: string) => void;
  reorderModules: (projectId: string, moduleIds: string[]) => void;
  addLesson: (projectId: string, moduleId: string, lesson: Omit<LessonPlan, 'id' | 'order'>) => LessonPlan;
  updateLesson: (projectId: string, moduleId: string, lessonId: string, updates: Partial<LessonPlan>) => void;
  removeLesson: (projectId: string, moduleId: string, lessonId: string) => void;
  toggleModuleCollapse: (projectId: string, moduleId: string) => void;

  // ── Design Document Generator ──
  designDocuments: DesignDocument[];
  activeDesignDocId: string | null;
  getDesignDocs: (projectId: string) => DesignDocument[];
  setActiveDesignDoc: (id: string | null) => void;
  createDesignDoc: (doc: Omit<DesignDocument, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => DesignDocument;
  updateDesignDoc: (id: string, updates: Partial<DesignDocument>) => void;
  addDesignDocSlide: (docId: string, slide: Omit<DesignDocSlide, 'id' | 'slideNumber'>) => DesignDocSlide;
  updateDesignDocSlide: (docId: string, slideId: string, updates: Partial<DesignDocSlide>) => void;
  removeDesignDocSlide: (docId: string, slideId: string) => void;
  deleteDesignDoc: (id: string) => void;

  // ── Quality Assurance Tools ──
  qaReports: Record<string, QAReport[]>; // keyed by projectId
  styleGuides: Record<string, StyleGuide>; // keyed by projectId
  activeQATool: QAToolType | null;
  getQAReports: (projectId: string) => QAReport[];
  getQAReport: (projectId: string, tool: QAToolType) => QAReport | null;
  setActiveQATool: (tool: QAToolType | null) => void;
  saveQAReport: (report: Omit<QAReport, 'id' | 'runAt'>) => QAReport;
  resolveQAFinding: (projectId: string, tool: QAToolType, findingId: string) => void;
  getStyleGuide: (projectId: string) => StyleGuide | null;
  setStyleGuide: (projectId: string, guide: Omit<StyleGuide, 'id' | 'version' | 'description' | 'uploadedAt'> & Partial<Pick<StyleGuide, 'version' | 'description'>>) => StyleGuide;
  removeStyleGuide: (projectId: string) => void;

  // ── Development Support Tools ──
  generatedQuestions: Record<string, AssessmentQuestion[]>; // keyed by projectId
  assessmentBlueprints: Record<string, AssessmentBlueprint[]>; // keyed by projectId
  generatedRubrics: Record<string, GeneratedRubric[]>; // keyed by projectId
  learnerPersonas: Record<string, LearnerPersona[]>; // keyed by projectId
  facilitatorGuides: Record<string, FacilitatorGuide[]>; // keyed by projectId
  quickGenerateResults: Record<string, QuickGenerateResult[]>; // keyed by projectId
  activeDevTool: DevToolType | null;
  setActiveDevTool: (tool: DevToolType | null) => void;

  // ── Theme ──
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // ── User Settings ──
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;

  // ── Prompt Shortcuts ──
  promptShortcuts: PromptShortcut[];
  addPromptShortcut: (shortcut: Omit<PromptShortcut, 'id' | 'createdAt' | 'isBuiltIn'>) => void;
  deletePromptShortcut: (id: string) => void;

  // ── Content Templates ──
  contentTemplates: ContentTemplate[];
  addContentTemplate: (template: Omit<ContentTemplate, 'id' | 'createdAt' | 'isBuiltIn'>) => void;
  updateContentTemplate: (id: string, updates: Partial<ContentTemplate>) => void;
  deleteContentTemplate: (id: string) => void;
  addGeneratedQuestions: (projectId: string, questions: AssessmentQuestion[]) => void;
  clearGeneratedQuestions: (projectId: string) => void;
  addAssessmentBlueprint: (blueprint: Omit<AssessmentBlueprint, 'id' | 'createdAt'>) => AssessmentBlueprint;
  addGeneratedRubric: (rubric: Omit<GeneratedRubric, 'id' | 'createdAt'>) => GeneratedRubric;
  deleteGeneratedRubric: (projectId: string, rubricId: string) => void;
  addLearnerPersona: (persona: Omit<LearnerPersona, 'id' | 'createdAt'>) => LearnerPersona;
  deleteLearnerPersona: (projectId: string, personaId: string) => void;
  addFacilitatorGuide: (guide: Omit<FacilitatorGuide, 'id' | 'createdAt'>) => FacilitatorGuide;
  deleteFacilitatorGuide: (projectId: string, guideId: string) => void;
  addQuickGenerateResult: (result: Omit<QuickGenerateResult, 'id' | 'createdAt'>) => QuickGenerateResult;
  getDevToolData: (projectId: string) => {
    questions: AssessmentQuestion[];
    blueprints: AssessmentBlueprint[];
    rubrics: GeneratedRubric[];
    personas: LearnerPersona[];
    guides: FacilitatorGuide[];
    quickResults: QuickGenerateResult[];
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // ── Navigation ──
  sidebarOpen: true,
  activeView: 'dashboard',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  // ── Projects ──
  projects: [sampleProject, sampleProject2],
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id, activeView: id ? 'chat' : 'dashboard' }),
  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      status: 'active',
      phaseProgress: { analysis: 0, design: 0, development: 0, implementation: 0, evaluation: 0 },
      stages: createInitialStages(),
      projectNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ projects: [newProject, ...state.projects] }));

    // Add welcome message
    const welcomeMsg: ChatMessage = {
      id: generateId(),
      projectId: newProject.id,
      role: 'assistant',
      content: `Welcome to **${newProject.title}**! I'm your AI course development agent and I'll guide you through the entire instructional design lifecycle.\n\nLet's start with the **Analysis Phase**. I need to understand:\n\n1. **Who** are your learners? (roles, experience level, prior knowledge)\n2. **What** do they need to learn? (performance gaps, business goals)\n3. **Why** is this training needed now? (trigger event, compliance, growth)\n4. **Where/How** will they learn? (environment, technology, constraints)\n5. **When** does this need to be ready? (timeline, milestones)\n\nTell me more about your learners and I'll help build a comprehensive learner persona.`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, welcomeMsg] }));

    return newProject;
  },
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      messages: state.messages.filter((m) => m.projectId !== id),
      materials: state.materials.filter((m) => m.projectId !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },
  addProjectNote: (projectId, note) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              projectNotes: [...(p.projectNotes || []), trimmed],
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  // ── Pipeline Stages ──
  getStage: (projectId, stageId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return null;
    return project.stages?.find((s) => s.id === stageId) || null;
  },

  isStageAvailable: (projectId, stageId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project || !project.stages) return false;
    const stage = project.stages.find((s) => s.id === stageId);
    if (!stage) return false;
    if (stage.dependsOn.length === 0) return true;
    return stage.dependsOn.every((depId) => {
      const dep = project.stages.find((s) => s.id === depId);
      return dep && (dep.status === 'committed' || dep.status === 'unlocked');
    });
  },

  setStageStatus: (projectId, stageId, status) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId || !p.stages) return p;
        return {
          ...p,
          stages: p.stages.map((s) =>
            s.id === stageId ? { ...s, status, updatedAt: new Date().toISOString() } : s
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  setStageArtifact: (projectId, stageId, markdown, metadata) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId || !p.stages) return p;
        return {
          ...p,
          stages: p.stages.map((s) => {
            if (s.id !== stageId) return s;
            const workingVersion: StageArtifactVersion = {
              version: s.currentVersion,
              committedAt: null,
              artifactMarkdown: markdown,
              artifactMetadata: metadata || {},
              authorNote: null,
            };
            const versions = s.versions.filter((v) => v.committedAt !== null);
            return {
              ...s,
              status: 'in-progress' as StageStatus,
              versions: [...versions, workingVersion],
              updatedAt: new Date().toISOString(),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  setStageArtifactFromChat: (projectId, stageId, newMarkdown, changeDescription) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId || !p.stages) return p;
        const stageIndex = p.stages.findIndex((s) => s.id === stageId);
        if (stageIndex === -1) return p;
        const updatedStages = p.stages.map((s, i) => {
          if (s.id === stageId) {
            const workingVersion: StageArtifactVersion = {
              version: s.currentVersion,
              committedAt: null,
              artifactMarkdown: newMarkdown,
              artifactMetadata: {},
              authorNote: null,
              chatRevision: true,
              chatChangeDescription: changeDescription,
            };
            const committedVersions = s.versions.filter((v) => v.committedAt !== null);
            return {
              ...s,
              status: 'in-progress' as StageStatus,
              versions: [...committedVersions, workingVersion],
              updatedAt: now,
            };
          }
          if (i > stageIndex && (s.status === 'committed' || s.status === 'in-progress')) {
            return { ...s, stale: true, updatedAt: now };
          }
          return s;
        });
        return { ...p, stages: updatedStages, updatedAt: now };
      }),
    }));
  },

  commitStage: (projectId, stageId, artifactMarkdown, artifactMetadata, authorNote) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId || !p.stages) return p;
        return {
          ...p,
          stages: p.stages.map((s) => {
            if (s.id !== stageId) return s;
            const newVersion: StageArtifactVersion = {
              version: s.currentVersion + 1,
              committedAt: new Date().toISOString(),
              artifactMarkdown,
              artifactMetadata,
              authorNote: authorNote || null,
            };
            const committedVersions = s.versions.filter((v) => v.committedAt !== null);
            return {
              ...s,
              status: 'committed' as StageStatus,
              currentVersion: s.currentVersion + 1,
              versions: [...committedVersions, newVersion],
              stale: false,
              updatedAt: new Date().toISOString(),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  unlockStage: (projectId, stageId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId || !p.stages) return p;
        const stageIndex = p.stages.findIndex((s) => s.id === stageId);
        if (stageIndex === -1) return p;
        const updatedStages = p.stages.map((s, i) => {
          if (s.id === stageId) {
            return { ...s, status: 'unlocked' as StageStatus, updatedAt: new Date().toISOString() };
          }
          if (i > stageIndex && (s.status === 'committed' || s.status === 'in-progress')) {
            return { ...s, stale: true, updatedAt: new Date().toISOString() };
          }
          return s;
        });
        return { ...p, stages: updatedStages, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  // ── Chat ──
  messages: sampleMessages,
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return newMessage;
  },
  getProjectMessages: (projectId) => {
    return get().messages.filter((m) => m.projectId === projectId);
  },

  // ── Materials ──
  materials: [sampleMaterial, sampleMaterial2],
  collections: [sampleCollection],
  selectedMaterialId: null,
  materialViewerOpen: false,
  setSelectedMaterial: (id) => set({ selectedMaterialId: id }),
  setMaterialViewerOpen: (open) => set({ materialViewerOpen: open }),
  addMaterial: (material) => {
    const newMaterial: Material = {
      ...material,
      id: generateId(),
      snippets: [],
      version: 1,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ materials: [newMaterial, ...state.materials] }));
    return newMaterial;
  },
  updateMaterial: (id, updates) => {
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },
  deleteMaterial: (id) => {
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }));
  },
  addSnippet: (materialId, content, page, note) => {
    const snippet = {
      id: generateId(),
      materialId,
      content,
      page,
      note,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === materialId
          ? { ...m, snippets: [...m.snippets, snippet], updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },
  addCollection: (name, description, materialIds) => {
    const collection: MaterialCollection = {
      id: generateId(),
      name,
      description,
      materialIds,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ collections: [...state.collections, collection] }));
    return collection;
  },

  // ── Tags ──
  tags: [
    { id: '1', name: 'healthcare', color: '#4c6ef5', category: 'topic' },
    { id: '2', name: 'cybersecurity', color: '#f03e3e', category: 'topic' },
    { id: '3', name: 'compliance', color: '#fab005', category: 'topic' },
    { id: '4', name: 'leadership', color: '#40c057', category: 'topic' },
    { id: '5', name: 'blended', color: '#7950f2', category: 'format' },
    { id: '6', name: 'bootcamp', color: '#fd7e14', category: 'format' },
  ],
  addTag: (tag) => {
    set((state) => ({ tags: [...state.tags, { ...tag, id: generateId() }] }));
  },

  // ── Search ──
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: { projects: [], materials: [] },
  performSearch: (query) => {
    const state = get();
    const q = query.toLowerCase();
    if (!q) {
      set({ searchResults: { projects: [], materials: [] }, searchQuery: '' });
      return;
    }
    const projects = state.projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.industry.toLowerCase().includes(q)
    );
    const materials = state.materials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.originalName.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.notes.toLowerCase().includes(q) ||
        (m.extractedText && m.extractedText.toLowerCase().includes(q))
    );
    set({ searchResults: { projects, materials }, searchQuery: query });
  },

  // ══════════════════════════════════════════════
  // NEEDS ANALYSIS WIZARD
  // ══════════════════════════════════════════════
  analysisWizards: {},

  getAnalysisWizard: (projectId) => {
    const wizard = get().analysisWizards[projectId];
    if (wizard) return wizard;
    return {
      status: 'not-started' as AnalysisWizardStatus,
      currentArea: 'performance-gap' as AnalysisArea,
      completedAreas: [],
      responses: [],
    };
  },

  startAnalysisWizard: (projectId) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          status: 'in-progress',
          currentArea: 'performance-gap' as AnalysisArea,
          completedAreas: [],
          responses: [],
        },
      },
    }));
  },

  setAnalysisArea: (projectId, area) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          currentArea: area,
        },
      },
    }));
  },

  addAnalysisResponse: (projectId, response) => {
    const newResponse: AnalysisResponse = {
      ...response,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          responses: [...(state.analysisWizards[projectId]?.responses || []), newResponse],
        },
      },
    }));
  },

  completeAnalysisArea: (projectId, area) => {
    set((state) => {
      const wizard = state.analysisWizards[projectId];
      if (!wizard) return state;
      return {
        analysisWizards: {
          ...state.analysisWizards,
          [projectId]: {
            ...wizard,
            completedAreas: [...wizard.completedAreas, area],
          },
        },
      };
    });
  },

  setAnalysisReport: (projectId, report) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          report,
        },
      },
    }));
  },

  completeAnalysisWizard: (projectId) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          status: 'completed',
        },
      },
    }));
    // Update project phase progress
    get().updateProject(projectId, {
      phaseProgress: {
        ...get().projects.find((p) => p.id === projectId)!.phaseProgress,
        analysis: 100,
      },
    });
  },

  // ══════════════════════════════════════════════
  // COURSE OUTLINE BUILDER
  // ══════════════════════════════════════════════
  courseOutlines: {},

  getCourseOutline: (projectId) => {
    return get().courseOutlines[projectId] || null;
  },

  createCourseOutline: (projectId, courseGoal) => {
    const outline: CourseOutline = {
      id: generateId(),
      projectId,
      courseGoal,
      totalDuration: 0,
      modules: [],
      bloomDistribution: { remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0 },
      varkCoverage: { visual: 0, auditory: 0, readWrite: 0, kinesthetic: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    set((state) => ({
      courseOutlines: { ...state.courseOutlines, [projectId]: outline },
    }));
    return outline;
  },

  updateCourseOutline: (projectId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, ...updates, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  addModule: (projectId, moduleData) => {
    const newModule: CourseModule = {
      ...moduleData,
      id: generateId(),
      lessons: [],
      order: (get().courseOutlines[projectId]?.modules.length || 0) + 1,
    };
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const updated = {
        ...outline,
        modules: [...outline.modules, newModule],
        totalDuration: outline.totalDuration + newModule.duration,
        updatedAt: new Date().toISOString(),
      };
      return { courseOutlines: { ...state.courseOutlines, [projectId]: updated } };
    });
    return newModule;
  },

  updateModule: (projectId, moduleId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m));
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  removeModule: (projectId, moduleId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules
        .filter((m) => m.id !== moduleId)
        .map((m, i) => ({ ...m, order: i + 1 }));
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  reorderModules: (projectId, moduleIds) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const reordered = moduleIds
        .map((id, i) => {
          const mod = outline.modules.find((m) => m.id === id);
          return mod ? { ...mod, order: i + 1 } : null;
        })
        .filter(Boolean) as CourseModule[];
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules: reordered, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  addLesson: (projectId, moduleId, lessonData) => {
    const outline = get().courseOutlines[projectId];
    const mod = outline?.modules.find((m) => m.id === moduleId);
    const newLesson: LessonPlan = {
      ...lessonData,
      id: generateId(),
      order: (mod?.lessons.length || 0) + 1,
    };
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, newLesson], duration: m.duration + newLesson.duration }
          : m
      );
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
    return newLesson;
  },

  updateLesson: (projectId, moduleId, lessonId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l));
        const duration = lessons.reduce((sum, l) => sum + l.duration, 0);
        return { ...m, lessons, duration };
      });
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  removeLesson: (projectId, moduleId, lessonId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 }));
        const duration = lessons.reduce((sum, l) => sum + l.duration, 0);
        return { ...m, lessons, duration };
      });
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  toggleModuleCollapse: (projectId, moduleId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) =>
        m.id === moduleId ? { ...m, collapsed: !m.collapsed } : m
      );
      return { courseOutlines: { ...state.courseOutlines, [projectId]: { ...outline, modules } } };
    });
  },

  // ══════════════════════════════════════════════
  // DESIGN DOCUMENT GENERATOR
  // ══════════════════════════════════════════════
  designDocuments: [],
  activeDesignDocId: null,

  getDesignDocs: (projectId) => {
    return get().designDocuments.filter((d) => d.projectId === projectId);
  },

  setActiveDesignDoc: (id) => set({ activeDesignDocId: id }),

  createDesignDoc: (doc) => {
    const newDoc: DesignDocument = {
      ...doc,
      id: generateId(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ designDocuments: [...state.designDocuments, newDoc] }));
    return newDoc;
  },

  updateDesignDoc: (id, updates) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  addDesignDocSlide: (docId, slideData) => {
    const doc = get().designDocuments.find((d) => d.id === docId);
    const newSlide: DesignDocSlide = {
      ...slideData,
      id: generateId(),
      slideNumber: (doc?.slides.length || 0) + 1,
    };
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? { ...d, slides: [...d.slides, newSlide], updatedAt: new Date().toISOString() }
          : d
      ),
    }));
    return newSlide;
  },

  updateDesignDocSlide: (docId, slideId, updates) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              slides: d.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
    }));
  },

  removeDesignDocSlide: (docId, slideId) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              slides: d.slides
                .filter((s) => s.id !== slideId)
                .map((s, i) => ({ ...s, slideNumber: i + 1 })),
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
    }));
  },

  deleteDesignDoc: (id) => {
    set((state) => ({
      designDocuments: state.designDocuments.filter((d) => d.id !== id),
      activeDesignDocId: state.activeDesignDocId === id ? null : state.activeDesignDocId,
    }));
  },

  // ══════════════════════════════════════════════
  // QUALITY ASSURANCE TOOLS
  // ══════════════════════════════════════════════
  qaReports: {},
  styleGuides: {},
  activeQATool: null,

  getQAReports: (projectId) => {
    return get().qaReports[projectId] || [];
  },

  getQAReport: (projectId, tool) => {
    const reports = get().qaReports[projectId] || [];
    return reports.find((r) => r.tool === tool) || null;
  },

  setActiveQATool: (tool) => set({ activeQATool: tool }),

  saveQAReport: (reportData) => {
    const report: QAReport = {
      ...reportData,
      id: generateId(),
      runAt: new Date().toISOString(),
    };
    set((state) => {
      const existing = state.qaReports[report.projectId] || [];
      // Replace existing report for same tool, or add new
      const filtered = existing.filter((r) => r.tool !== report.tool);
      return {
        qaReports: {
          ...state.qaReports,
          [report.projectId]: [...filtered, report],
        },
      };
    });
    return report;
  },

  resolveQAFinding: (projectId, tool, findingId) => {
    set((state) => {
      const reports = state.qaReports[projectId] || [];
      const updatedReports = reports.map((r) => {
        if (r.tool !== tool) return r;
        return {
          ...r,
          findings: r.findings.map((f) =>
            f.id === findingId ? { ...f, resolved: true } : f
          ),
        };
      });
      return {
        qaReports: { ...state.qaReports, [projectId]: updatedReports },
      };
    });
  },

  getStyleGuide: (projectId) => {
    return get().styleGuides[projectId] || null;
  },

  setStyleGuide: (projectId, guideData) => {
    const guide: StyleGuide = {
      ...guideData,
      id: guideData.type === 'built-in' ? 'built-in-plain-language-v1' : generateId(),
      version: guideData.version || '1.0',
      description: guideData.description || '',
      uploadedAt: new Date().toISOString(),
    };
    set((state) => ({
      styleGuides: { ...state.styleGuides, [projectId]: guide },
    }));
    return guide;
  },

  removeStyleGuide: (projectId) => {
    set((state) => {
      const { [projectId]: _, ...rest } = state.styleGuides;
      return { styleGuides: rest };
    });
  },

  // ══════════════════════════════════════════════
  // DEVELOPMENT SUPPORT TOOLS
  // ══════════════════════════════════════════════
  generatedQuestions: {},
  assessmentBlueprints: {},
  generatedRubrics: {},
  learnerPersonas: {},
  facilitatorGuides: {},
  quickGenerateResults: {},
  activeDevTool: null,

  // ── Theme & Settings ──
  theme: 'light' as 'light' | 'dark',
  userSettings: {
    displayName: '',
    defaultCourseType: 'self-paced' as CourseType,
    defaultBloomTarget: 'apply' as BloomLevel,
    autoSave: true,
    showWordCount: true,
    showBloomsDistribution: true,
    claudeMdContent: DEFAULT_CLAUDE_MD,
  },
  promptShortcuts: DEFAULT_PROMPT_SHORTCUTS,
  contentTemplates: DEFAULT_CONTENT_TEMPLATES,

  setActiveDevTool: (tool) => set({ activeDevTool: tool }),

  addGeneratedQuestions: (projectId, questions) => {
    set((state) => ({
      generatedQuestions: {
        ...state.generatedQuestions,
        [projectId]: [...(state.generatedQuestions[projectId] || []), ...questions],
      },
    }));
  },

  clearGeneratedQuestions: (projectId) => {
    set((state) => ({
      generatedQuestions: { ...state.generatedQuestions, [projectId]: [] },
    }));
  },

  addAssessmentBlueprint: (blueprintData) => {
    const blueprint: AssessmentBlueprint = {
      ...blueprintData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      assessmentBlueprints: {
        ...state.assessmentBlueprints,
        [blueprint.projectId]: [...(state.assessmentBlueprints[blueprint.projectId] || []), blueprint],
      },
    }));
    return blueprint;
  },

  addGeneratedRubric: (rubricData) => {
    const rubric: GeneratedRubric = {
      ...rubricData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      generatedRubrics: {
        ...state.generatedRubrics,
        [rubric.projectId]: [...(state.generatedRubrics[rubric.projectId] || []), rubric],
      },
    }));
    return rubric;
  },

  deleteGeneratedRubric: (projectId, rubricId) => {
    set((state) => ({
      generatedRubrics: {
        ...state.generatedRubrics,
        [projectId]: (state.generatedRubrics[projectId] || []).filter((r) => r.id !== rubricId),
      },
    }));
  },

  addLearnerPersona: (personaData) => {
    const persona: LearnerPersona = {
      ...personaData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      learnerPersonas: {
        ...state.learnerPersonas,
        [persona.projectId]: [...(state.learnerPersonas[persona.projectId] || []), persona],
      },
    }));
    return persona;
  },

  deleteLearnerPersona: (projectId, personaId) => {
    set((state) => ({
      learnerPersonas: {
        ...state.learnerPersonas,
        [projectId]: (state.learnerPersonas[projectId] || []).filter((p) => p.id !== personaId),
      },
    }));
  },

  addFacilitatorGuide: (guideData) => {
    const guide: FacilitatorGuide = {
      ...guideData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      facilitatorGuides: {
        ...state.facilitatorGuides,
        [guide.projectId]: [...(state.facilitatorGuides[guide.projectId] || []), guide],
      },
    }));
    return guide;
  },

  deleteFacilitatorGuide: (projectId, guideId) => {
    set((state) => ({
      facilitatorGuides: {
        ...state.facilitatorGuides,
        [projectId]: (state.facilitatorGuides[projectId] || []).filter((g) => g.id !== guideId),
      },
    }));
  },

  addQuickGenerateResult: (resultData) => {
    const result: QuickGenerateResult = {
      ...resultData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      quickGenerateResults: {
        ...state.quickGenerateResults,
        [result.projectId]: [...(state.quickGenerateResults[result.projectId] || []), result],
      },
    }));
    return result;
  },

  getDevToolData: (projectId) => {
    const state = get();
    return {
      questions: state.generatedQuestions[projectId] || [],
      blueprints: state.assessmentBlueprints[projectId] || [],
      rubrics: state.generatedRubrics[projectId] || [],
      personas: state.learnerPersonas[projectId] || [],
      guides: state.facilitatorGuides[projectId] || [],
      quickResults: state.quickGenerateResults[projectId] || [],
    };
  },

  // ── Theme ──
  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },

  // ── User Settings ──
  updateUserSettings: (settings) => {
    set((state) => ({ userSettings: { ...state.userSettings, ...settings } }));
  },

  // ── Prompt Shortcuts ──
  addPromptShortcut: (shortcut) => {
    const newShortcut: PromptShortcut = {
      ...shortcut,
      id: generateId(),
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ promptShortcuts: [...state.promptShortcuts, newShortcut] }));
  },
  deletePromptShortcut: (id) => {
    set((state) => ({
      promptShortcuts: state.promptShortcuts.filter((s) => s.id !== id || s.isBuiltIn),
    }));
  },

  // ── Content Templates ──
  addContentTemplate: (template) => {
    const newTemplate: ContentTemplate = {
      ...template,
      id: generateId(),
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ contentTemplates: [...state.contentTemplates, newTemplate] }));
  },
  updateContentTemplate: (id, updates) => {
    set((state) => ({
      contentTemplates: state.contentTemplates.map((t) =>
        t.id === id && !t.isBuiltIn ? { ...t, ...updates } : t
      ),
    }));
  },
  deleteContentTemplate: (id) => {
    set((state) => ({
      contentTemplates: state.contentTemplates.filter((t) => t.id !== id || t.isBuiltIn),
    }));
  },
    }),
    {
      name: 'lxp-app-store',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 1 && state.projects) {
          state.projects = (state.projects as Project[]).map((p) => ({
            ...p,
            stages: p.stages || createInitialStages(),
          }));
        }
        if (version < 2 && state.projects) {
          state.projects = (state.projects as Project[]).map((p) => ({
            ...p,
            projectNotes: p.projectNotes || [],
          }));
        }
        if (version < 3 && state.projects) {
          state.projects = (state.projects as Project[]).map((p) => ({
            ...p,
            stages: normalizeStages(p.stages),
          }));
        }
        return state as unknown as AppState;
      },
      partialize: (state) => ({
        projects: state.projects,
        messages: state.messages,
        materials: state.materials,
        collections: state.collections,
        tags: state.tags,
        courseOutlines: state.courseOutlines,
        analysisWizards: state.analysisWizards,
        designDocuments: state.designDocuments,
        qaReports: state.qaReports,
        styleGuides: state.styleGuides,
        generatedQuestions: state.generatedQuestions,
        assessmentBlueprints: state.assessmentBlueprints,
        generatedRubrics: state.generatedRubrics,
        learnerPersonas: state.learnerPersonas,
        facilitatorGuides: state.facilitatorGuides,
        quickGenerateResults: state.quickGenerateResults,
        theme: state.theme,
        userSettings: state.userSettings,
        promptShortcuts: state.promptShortcuts,
        contentTemplates: state.contentTemplates,
      }),
    }
  )
);
