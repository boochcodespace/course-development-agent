import { loadStyleGuide, type LoadedStyleGuide } from '../style-guide/loader';
import { COURSE_DEV_AGENT, type AgentDefinition } from './agents';

/**
 * Maximum combined character count for attached materials injected into a
 * single request. ~60k tokens at 4 chars/token. Exported so call sites can
 * report the limit in UI without duplicating the constant.
 */
export const MAX_CONTEXT_CHARS = 240_000;

/** A source material being attached to a single request for inline context. */
export interface AttachedMaterial {
  id: string;
  name: string;
  text: string;
}

export interface PromptContext {
  projectTitle?: string;
  courseType?: string;
  currentPhase?: string;
  targetAudience?: string;
  /** Legacy: short excerpts (3k chars each) from the project's materials. */
  materialExcerpts?: string[];
  /** Full analysis report summary to pass as prior-stage context. */
  analysisReport?: string;
  /** Course outline summary to pass as prior-stage context. */
  outlineSummary?: string;
  /** Optional custom knowledge base text (e.g. from CLAUDE.md). */
  customKnowledgeBase?: string;
  /** Full-text materials attached to this specific request. */
  attachedMaterials?: AttachedMaterial[];
  /** The style guide the user selected in Settings. Defaults to the built-in guide. */
  styleGuide?: LoadedStyleGuide | null;
}

// ── Constant sections ─────────────────────────────────────────────────────────

const INSTRUCTIONAL_DESIGN_PRINCIPLES = `Apply these instructional design principles in all recommendations:

ADDIE: Every project follows Analysis, Design, Development, Implementation, Evaluation. Never skip Analysis.

Bloom's Taxonomy: Target Apply level or above for professional training. Use measurable action verbs.

Adult Learning (Knowles): Self-directed, experience-based, relevance-oriented, problem-centered, internally motivated.

Merrill's First Principles: Activate prior knowledge, demonstrate with examples, apply with coaching, integrate into practice.

Gagne's Events (4-beat): Opener (gain attention, state objectives, recall prior), Core (present content, guide), Practice (elicit performance, feedback), Close (assess, transfer).

ARCS (Keller): Design for Attention, Relevance, Confidence, Satisfaction.

ZPD (Vygotsky): Target the Learning Zone. Scaffold with worked examples, partial completion, hints, gradual release (I do, We do, You do). The Frustration Zone is beyond current ability even with support.

Cognitive Load (Sweller): Minimize extraneous load, manage intrinsic load through chunking, maximize germane load.

Mayer's Multimedia: Coherence (cut extraneous), signaling (highlight key info), segmenting (learner-paced chunks), personalization (use "you").

Multimodal (VARK): Include 2-3 modalities per module. Visual, Auditory, Read/Write, Kinesthetic.

Meaningful Interactivity: Decisions with real consequences, explanatory feedback, scenario branching, real-world ambiguity. No fake interactivity.

Accessibility: WCAG 2.2 AA. Alt text, captions, 4.5:1 contrast, keyboard accessible, focus appearance, target size 24x24px min.`;

// ── Section builders ──────────────────────────────────────────────────────────

function buildStyleGuideSection(selected?: LoadedStyleGuide | null): string {
  const guide = selected ?? loadStyleGuide();
  if (!guide) return '';

  return `STYLE GUIDE: ${guide.name}

Apply this style guide to every word of learner-facing and stakeholder-facing text you write. Follow it silently. Do not narrate the rules in your output. If two rules conflict, the more specific rule wins.

${guide.text}`;
}

function buildContextSection(ctx: PromptContext): string {
  const parts: string[] = [];

  if (ctx.projectTitle) parts.push(`PROJECT: ${ctx.projectTitle}`);
  if (ctx.courseType) parts.push(`FORMAT: ${ctx.courseType}`);
  if (ctx.currentPhase) parts.push(`CURRENT ADDIE PHASE: ${ctx.currentPhase}`);
  if (ctx.targetAudience) parts.push(`AUDIENCE: ${ctx.targetAudience}`);
  if (ctx.analysisReport) parts.push(`NEEDS ANALYSIS SUMMARY:\n${ctx.analysisReport}`);
  if (ctx.outlineSummary) parts.push(`COURSE OUTLINE SUMMARY:\n${ctx.outlineSummary}`);

  if (ctx.materialExcerpts && ctx.materialExcerpts.length > 0) {
    const combined = ctx.materialExcerpts
      .map((excerpt, i) => `--- Source Material ${i + 1} ---\n${excerpt.slice(0, 3000)}`)
      .join('\n\n');
    parts.push(`SOURCE MATERIALS:\n${combined}`);
  }

  if (parts.length === 0) return '';
  return `PROJECT CONTEXT:\n${parts.join('\n')}`;
}

function buildMaterialSection(materials: AttachedMaterial[]): string {
  if (materials.length === 0) return '';

  // Truncate largest-first until total fits within limit.
  let total = materials.reduce((sum, m) => sum + m.text.length, 0);
  const texts = materials.map((m) => ({ ...m, truncated: false }));

  while (total > MAX_CONTEXT_CHARS && texts.some((m) => !m.truncated)) {
    const largest = texts.reduce((a, b) => (a.text.length > b.text.length ? a : b));
    const excess = total - MAX_CONTEXT_CHARS;
    const newLen = Math.max(0, largest.text.length - excess);
    console.log(
      `[system-prompt] Truncating material "${largest.name}" from ${largest.text.length} to ${newLen} chars (limit ${MAX_CONTEXT_CHARS})`
    );
    largest.text =
      largest.text.slice(0, newLen) +
      `\n[Material truncated at ${newLen.toLocaleString()} characters due to context size limits]\n`;
    largest.truncated = true;
    total = texts.reduce((sum, m) => sum + m.text.length, 0);
  }

  const sections = texts
    .map((m, i) => `Material ${i + 1}: ${m.name}\n${m.text}`)
    .join('\n\n---\n\n');

  return `Reference Materials\nThe user has attached the following source materials to this conversation. Use them as primary context for your response.\n\n${sections}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compose a full system prompt for an AI request.
 *
 * @param ctx  Project and request context. Pass attachedMaterials for
 *             per-request full-text injection with automatic truncation.
 * @param agent  The agent definition to use. Defaults to COURSE_DEV_AGENT.
 *               Pass a different agent to swap identity/behavior for this request.
 */
export function composeSystemPrompt(ctx?: PromptContext, agent: AgentDefinition = COURSE_DEV_AGENT): string {
  const sections: string[] = [
    agent.systemBlock,
    INSTRUCTIONAL_DESIGN_PRINCIPLES,
    buildStyleGuideSection(ctx?.styleGuide),
  ].filter(Boolean);

  if (ctx) {
    const contextSection = buildContextSection(ctx);
    if (contextSection) sections.push(contextSection);

    if (ctx.customKnowledgeBase) {
      sections.push(`CUSTOM KNOWLEDGE BASE:\n${ctx.customKnowledgeBase}`);
    }

    if (ctx.attachedMaterials && ctx.attachedMaterials.length > 0) {
      const materialSection = buildMaterialSection(ctx.attachedMaterials);
      if (materialSection) sections.push(materialSection);
    }
  }

  return sections.join('\n\n');
}
