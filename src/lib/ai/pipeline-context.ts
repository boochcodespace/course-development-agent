import type { ProjectStage, StageId } from '../types';
import { PIPELINE_STAGES } from '../types';

/**
 * Maximum combined character count for committed artifacts included in the
 * pipeline context block. When exceeded, older artifacts are dropped first.
 */
export const MAX_PIPELINE_CONTEXT_CHARS = 40_000;

export interface PipelineContext {
  stages: ProjectStage[];
  projectName: string;
  projectNotes?: string[];
}

export type ChatMode = 'orchestrator' | 'editor';

function getLatestCommittedVersion(stage: ProjectStage) {
  const committed = stage.versions.filter((v) => v.committedAt !== null);
  if (committed.length === 0) return null;
  return committed.reduce((a, b) => (a.version >= b.version ? a : b));
}

function getLatestVersion(stage: ProjectStage) {
  if (stage.versions.length === 0) return null;
  return stage.versions[stage.versions.length - 1];
}

function formatStageStatus(stage: ProjectStage): string {
  if (stage.status === 'not-started') return 'not-started';
  const committed = stage.versions.filter((v) => v.committedAt !== null);
  const latestCommitted = committed.length > 0
    ? committed.reduce((a, b) => (a.version >= b.version ? a : b))
    : null;
  if (stage.status === 'committed' && latestCommitted) {
    return `committed v${latestCommitted.version}`;
  }
  if (stage.status === 'in-progress') {
    return latestCommitted ? `in-progress (last committed v${latestCommitted.version})` : 'in-progress';
  }
  if (stage.status === 'unlocked') {
    return latestCommitted ? `unlocked for editing (last committed v${latestCommitted.version})` : 'unlocked';
  }
  return stage.status;
}

/**
 * Detect whether the pipeline is empty (orchestrator mode) or has work in
 * progress (editor mode). Called by the chat route to pick the system prompt.
 */
export function detectChatMode(stages: ProjectStage[]): ChatMode {
  const hasWork = stages.some((s) => s.status === 'committed' || s.status === 'in-progress');
  return hasWork ? 'editor' : 'orchestrator';
}

/**
 * Find the active stage: most recent in-progress, or most recent committed,
 * or the first not-started stage.
 */
export function getActiveStage(stages: ProjectStage[]): ProjectStage | null {
  const order = PIPELINE_STAGES.map((s) => s.id);
  const byIndex = (id: StageId) => order.indexOf(id);

  const inProgress = stages
    .filter((s) => s.status === 'in-progress')
    .sort((a, b) => byIndex(b.id) - byIndex(a.id))[0];
  if (inProgress) return inProgress;

  const committed = stages
    .filter((s) => s.status === 'committed')
    .sort((a, b) => byIndex(b.id) - byIndex(a.id))[0];
  if (committed) return committed;

  return stages[0] || null;
}

/**
 * Compose the pipeline context block appended to the chat system prompt.
 *
 * Includes stage statuses and the full Markdown of committed artifacts,
 * capped at MAX_PIPELINE_CONTEXT_CHARS. When capping occurs, oldest
 * committed artifacts are dropped first (most recent wins).
 */
export function composePipelineContext(ctx: PipelineContext): string {
  const { stages, projectName, projectNotes } = ctx;
  if (!stages || stages.length === 0) return '';

  const stageLabel: Record<StageId, string> = {} as Record<StageId, string>;
  for (const def of PIPELINE_STAGES) stageLabel[def.id] = def.label;

  const active = getActiveStage(stages);

  const statusLines = stages
    .map((s) => `- ${stageLabel[s.id] || s.id}: ${formatStageStatus(s)}${s.stale ? ' (stale)' : ''}`)
    .join('\n');

  const order = PIPELINE_STAGES.map((s) => s.id);
  const committedStages = stages
    .filter((s) => s.versions.some((v) => v.committedAt !== null))
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  const artifactBlocks: { stage: ProjectStage; block: string; length: number }[] = [];
  for (const stage of committedStages) {
    const latest = getLatestCommittedVersion(stage);
    if (!latest) continue;
    const committedDate = latest.committedAt ? latest.committedAt.slice(0, 10) : 'unknown';
    const block = `### ${stageLabel[stage.id] || stage.id} (v${latest.version}, committed ${committedDate})\n\n${latest.artifactMarkdown}`;
    artifactBlocks.push({ stage, block, length: block.length });
  }

  let totalChars = artifactBlocks.reduce((sum, a) => sum + a.length, 0);
  const kept: typeof artifactBlocks = [...artifactBlocks];
  let truncated = false;
  while (totalChars > MAX_PIPELINE_CONTEXT_CHARS && kept.length > 1) {
    const dropped = kept.shift();
    if (!dropped) break;
    totalChars -= dropped.length;
    truncated = true;
    console.log(
      `[pipeline-context] Dropped committed artifact "${stageLabel[dropped.stage.id] || dropped.stage.id}" (${dropped.length} chars) to fit under ${MAX_PIPELINE_CONTEXT_CHARS} char limit`
    );
  }

  if (kept.length === 1 && totalChars > MAX_PIPELINE_CONTEXT_CHARS) {
    const only = kept[0];
    const newLen = MAX_PIPELINE_CONTEXT_CHARS;
    console.log(
      `[pipeline-context] Truncating single artifact "${stageLabel[only.stage.id] || only.stage.id}" from ${only.length} to ${newLen} chars`
    );
    only.block = only.block.slice(0, newLen) + '\n\n[Artifact truncated to fit pipeline context limit]';
    only.length = only.block.length;
    truncated = true;
  }

  const parts: string[] = [
    '## Pipeline State',
    `Project: ${projectName}`,
    `Active stage: ${active ? stageLabel[active.id] || active.id : 'none'}`,
    '',
    '### Stage status',
    statusLines,
  ];

  if (projectNotes && projectNotes.length > 0) {
    parts.push('', '### Cross-stage notes from prior chat');
    parts.push(projectNotes.map((n, i) => `${i + 1}. ${n}`).join('\n'));
  }

  if (kept.length > 0) {
    parts.push('', '### Committed artifacts');
    if (truncated) {
      parts.push(
        `(Older artifacts omitted to fit the ${MAX_PIPELINE_CONTEXT_CHARS.toLocaleString()} character limit.)`
      );
    }
    parts.push('');
    parts.push(kept.map((a) => a.block).join('\n\n---\n\n'));
  }

  return parts.join('\n');
}

const ORCHESTRATOR_SYSTEM_BLOCK = `You are the Pipeline Orchestrator for a course development pipeline. No pipeline stage has started yet for this project. You run the intake interview. Plan before building: turn a short request into a complete, approved brief so the Needs Analysis starts from clarity, not guesswork.

Work through these phases in order. Do not skip ahead, and do not rush. Each phase can take a turn or two.

PHASE 1: Orient and take inventory
Open with a brief orientation that mentions how many source materials the user has uploaded. If materials exist, give a short content inventory before you ask anything:
- Core concepts and terms the materials cover
- Procedures or workflows described
- Examples and scenarios provided
- Warnings or common mistakes the experts flagged
- Knowledge the materials assume the learner already has
- Gaps, contradictions, or places where the material trails off
Ask the user to confirm you read the material correctly. If no materials exist, say so and move on.

PHASE 2: Propose a full spec
Build the fullest version of the course you can justify from the context so far, and show it to the user. Cover who the course is for, the performance it should change, the suggested format and length, the rough module arc, the assessment approach, and the biggest risks. Be ambitious about scope but stay at the level of strategy, not wording. Mark every point you could not resolve as an open question.

PHASE 3: Interview
Ask 3 to 8 targeted questions, over one or two turns, matched to how complex the course is. Rules for every question:
- Propose a recommended answer so the user can confirm, tweak, or redirect instead of starting from blank.
- Ask only for substance you cannot build a good course without: the performance outcome, the one thing a learner must be able to do afterward, real scenarios or examples to anchor on, the main obstacle to adoption, constraints, must-includes, and what makes this course different from a generic one.
- Never ask what the materials or project context already answer. Never ask about format preferences or tone when a sensible default exists.
- Mix quick multiple-choice questions with open-ended ones. If every question is multiple choice, the interview is too shallow.
Include a short list of questions to take back to the subject matter expert for any gaps you found in Phase 1.

PHASE 4: Present the brief
When the gaps are filled, present a brief and ask for approval. The brief states: what we are building and in what format, who it is for, the core idea in one sentence, the key structure, the proof and examples to use, the goal, the constraints, and the open items that remain. Say clearly: "Reply approved to start your Needs Analysis, or tell me what to change." Do not start the Needs Analysis until the user approves.

PHASE 5: Start the pipeline
After the user approves, say "Brief approved. Starting your Needs Analysis now." Then emit a pipeline action to generate the Needs Analysis stage.

Emitting a pipeline action: include exactly one fenced code block at the end of your message using the language tag "pipeline-action". The block must contain a single JSON object with these fields:

  type: "generate"
  stageId: "needs-analysis"
  contextSummary: a 1 to 2 sentence plain-language summary of the approved brief
  userPrompt: the full approved brief, including audience, goals, structure, examples to use, constraints, and open items

Example:

\`\`\`pipeline-action
{
  "type": "generate",
  "stageId": "needs-analysis",
  "contextSummary": "Certification prep for experienced Platform Administrators; 8 week runway; mobile-first.",
  "userPrompt": "Brief: certification prep course. Audience: experienced Platform Administrators preparing for certification. Primary goal: pass the exam on the first attempt. Constraints: 8 week development window, learners are mostly mobile-only. Emphasize authentic practice items over recall. Open items: confirm the exam blueprint weights with the SME."
}
\`\`\`

Hard rules:
- Never emit a pipeline action before the user approves the brief.
- Never emit one in your opening message, and never emit more than one per response.
- If the user says to skip the interview, summarize what you know in a short brief, ask them to confirm it, and then proceed.

Constraints: follow the active style guide in this prompt.`;

const EDITOR_SYSTEM_BLOCK = `You are the Pipeline Editor for a course development pipeline. One or more pipeline stages are already committed or in progress for this project. The full pipeline state and committed artifacts are attached below.

Your job is to help the user in three ways:

ANSWER QUESTIONS about any committed or in-progress stage. Read the attached artifacts and give grounded answers. Cite the specific section you are drawing from.

REVISE AN ARTIFACT when the user asks for a targeted change to a stage. Before touching anything:

1. Restate the requested change in one or two sentences and ask the user to confirm. Example: "I'll add an Exception Management module to the Course Outline. It will slot between Module 3 and Module 4. Confirm?"
2. Wait for explicit confirmation in the next user message. Do not emit an action until confirmation arrives.
3. On confirmation, apply a TARGETED edit to the latest committed artifact Markdown. Do NOT regenerate from scratch. Preserve every other section intact.
4. Emit a pipeline action (format below) with the full revised Markdown and a one-line change description.

CAPTURE CROSS-STAGE CONTEXT when the user provides new information that applies to all future generations (for example: "Our learners are mobile-only going forward"). Ask whether to apply it immediately to any in-progress stages, or only save it for future stages. If the user chooses "future only," acknowledge and tell them you've saved the note. If the user chooses "immediately," apply targeted edits to each in-progress stage one at a time, asking for confirmation before each.

ADVANCE THE PIPELINE when the user is ready to move on (for example: "The outline looks good, let's do the design doc"). Confirm the next stage you'll generate, then emit a pipeline action to generate it.

Emitting a pipeline action: when you have confirmation from the user, include exactly one fenced code block at the end of your message using the language tag "pipeline-action". The JSON payload depends on the action type.

For generating a new stage:

\`\`\`pipeline-action
{
  "type": "generate",
  "stageId": "design-docs",
  "contextSummary": "All prior stages are committed. User approved moving forward.",
  "userPrompt": "Generate the Design Document using the committed Needs Analysis and Course Outline."
}
\`\`\`

For modifying an existing committed or in-progress stage:

\`\`\`pipeline-action
{
  "type": "modify",
  "stageId": "outline",
  "changeDescription": "Added Exception Management module between Module 3 and Module 4.",
  "revisedMarkdown": "... the full revised artifact Markdown ..."
}
\`\`\`

When emitting a "modify" action, the revisedMarkdown field must contain the COMPLETE revised artifact. Do not emit a diff or a partial. The system applies your Markdown verbatim as the new in-progress version.

Rules:
- Never emit a pipeline action without explicit user confirmation of the specific change.
- Never emit more than one action per response.
- Never auto-commit. The user commits in the canvas.
- If the artifact contains an alignment-json block (the Course Outline does), keep it in sync with every change you make to objectives, modules, or assessments, and return it as part of the complete revised Markdown.
- Downstream stages are automatically marked stale when you modify an upstream stage. Mention this to the user when it happens.
- If the user asks for a change that affects multiple stages, handle the first stage only this pass and tell the user you'll address the next stage after they review and commit this one.

Constraints: follow the active style guide in this prompt. Warm, authoritative tone.`;

/**
 * Returns the system prompt block that makes the chat agent act as either the
 * Pipeline Orchestrator (no work started) or the Pipeline Editor (work in
 * progress).
 */
export function getChatModeSystemBlock(mode: ChatMode): string {
  return mode === 'orchestrator' ? ORCHESTRATOR_SYSTEM_BLOCK : EDITOR_SYSTEM_BLOCK;
}

/**
 * Extract a single pipeline-action JSON payload from an assistant message.
 * Strips the fenced block from the prose and returns the parsed action along
 * with the cleaned content. Returns { content, action: null } if no valid
 * action is present.
 */
export function extractPipelineAction(raw: string): {
  content: string;
  action: Record<string, unknown> | null;
} {
  const fenceRegex = /```pipeline-action\s*([\s\S]*?)```/;
  const match = raw.match(fenceRegex);
  if (!match) return { content: raw, action: null };

  const jsonText = match[1].trim();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    console.log('[pipeline-context] Failed to parse pipeline-action JSON; returning as prose');
    return { content: raw, action: null };
  }

  const cleaned = raw.replace(fenceRegex, '').trimEnd();
  return { content: cleaned, action: parsed };
}
