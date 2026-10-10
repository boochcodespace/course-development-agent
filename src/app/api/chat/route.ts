import { NextRequest, NextResponse } from 'next/server';
import { loadActiveStyleGuide } from '@/lib/style-guide/active';
import { complete, type AIMessage } from '@/lib/ai/provider';
import { composeSystemPrompt, type AttachedMaterial } from '@/lib/ai/system-prompt';
import { detectCreationIntent } from '@/lib/ai/interviewer';
import { COURSE_DEV_AGENT, INTERVIEWER_AGENT } from '@/lib/ai/agents';
import {
  composePipelineContext,
  detectChatMode,
  getChatModeSystemBlock,
  extractPipelineAction,
  type PipelineContext,
} from '@/lib/ai/pipeline-context';
import type { ProjectStage, PipelineActionPayload, StageId } from '@/lib/types';
import { PIPELINE_STAGES } from '@/lib/types';

function sanitizePipelineAction(
  raw: Record<string, unknown> | null
): PipelineActionPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const type = raw.type;
  const stageId = raw.stageId;
  if (type !== 'generate' && type !== 'modify') return null;
  if (typeof stageId !== 'string') return null;
  if (!PIPELINE_STAGES.some((s) => s.id === stageId)) return null;

  const payload: PipelineActionPayload = {
    type,
    stageId: stageId as StageId,
  };
  if (typeof raw.contextSummary === 'string') payload.contextSummary = raw.contextSummary;
  if (typeof raw.userPrompt === 'string') payload.userPrompt = raw.userPrompt;
  if (typeof raw.revisedMarkdown === 'string') payload.revisedMarkdown = raw.revisedMarkdown;
  if (typeof raw.changeDescription === 'string') payload.changeDescription = raw.changeDescription;

  if (type === 'modify' && !payload.revisedMarkdown) return null;
  return payload;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      projectId,
      phase,
      history,
      projectTitle,
      courseType,
      targetAudience,
      analysisReport,
      outlineSummary,
      materialExcerpts,
      attachedMaterials,
      customKnowledgeBase,
      pipelineContext,
    } = body;

    if (!message || !projectId) {
      return NextResponse.json(
        { error: 'message and projectId are required' },
        { status: 400 }
      );
    }

    const pipeline = pipelineContext as PipelineContext | undefined;
    const pipelineStages: ProjectStage[] | undefined = pipeline?.stages;

    let agent;
    if (pipelineStages && pipelineStages.length > 0) {
      const mode = detectChatMode(pipelineStages);
      const chatModeBlock = getChatModeSystemBlock(mode);
      agent = {
        ...COURSE_DEV_AGENT,
        id: `chat-${mode}`,
        name: mode === 'orchestrator' ? 'Pipeline Orchestrator' : 'Pipeline Editor',
        systemBlock: `${COURSE_DEV_AGENT.systemBlock}\n\n${chatModeBlock}`,
        maxTokens: mode === 'editor' ? 8192 : COURSE_DEV_AGENT.maxTokens,
      };
    } else {
      agent = detectCreationIntent(message) ? INTERVIEWER_AGENT : COURSE_DEV_AGENT;
    }

    const styleGuide = await loadActiveStyleGuide();

    let systemPrompt = composeSystemPrompt(
      {
        styleGuide,
        projectTitle,
        courseType,
        currentPhase: phase,
        targetAudience,
        analysisReport,
        outlineSummary,
        materialExcerpts,
        customKnowledgeBase,
        attachedMaterials: Array.isArray(attachedMaterials)
          ? (attachedMaterials as AttachedMaterial[])
          : [],
      },
      agent
    );

    if (pipeline && pipelineStages && pipelineStages.length > 0) {
      const pipelineBlock = composePipelineContext({
        stages: pipelineStages,
        projectName: pipeline.projectName || projectTitle || 'Untitled project',
        projectNotes: pipeline.projectNotes,
      });
      if (pipelineBlock) systemPrompt = `${systemPrompt}\n\n${pipelineBlock}`;
    }

    const messages: AIMessage[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-20)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    try {
      const result = await complete({
        messages,
        systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });

      const { content, action } = extractPipelineAction(result.content);
      const pipelineAction = sanitizePipelineAction(action);

      return NextResponse.json({
        id: `msg-${Date.now()}`,
        projectId,
        role: 'assistant',
        content,
        pipelineAction,
        timestamp: new Date().toISOString(),
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        truncated: result.truncated ?? false,
      });
    } catch (aiError) {
      console.error('AI provider error:', aiError);

      const errorMessage = aiError instanceof Error ? aiError.message : '';
      const isKeyMissing = errorMessage === 'NO_API_KEY';

      return NextResponse.json({
        id: `msg-${Date.now()}`,
        projectId,
        role: 'assistant',
        content: isKeyMissing
          ? 'No API key configured. Add one in Settings > API Keys, then try again.'
          : generateFallbackResponse(message, phase),
        timestamp: new Date().toISOString(),
        provider: 'fallback',
        error: isKeyMissing ? 'no_api_key' : errorMessage || 'AI provider unavailable',
      });
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message: string, phase?: string): string {
  const phaseGuidance: Record<string, string> = {
    analysis: "I'm helping you with the Analysis phase. Let's identify your learners, performance gaps, and constraints before moving forward. What do you know about your target audience?",
    design: "We're in the Design phase. I'll help you architect the learning experience with clear objectives and aligned assessments. What topic or module would you like to start structuring?",
    development: "We're in the Development phase. I can help you build content, activities, and assessments. What would you like to work on first?",
    implementation: "We're in the Implementation phase. I can help with facilitator guides, LMS configuration, or pilot planning. What do you need?",
    evaluation: "We're in the Evaluation phase. I can help design evaluation instruments or plan analytics. What aspect of the course would you like to measure?",
  };

  if (phase && phaseGuidance[phase]) {
    return `${phaseGuidance[phase]}\n\n(Note: AI provider is not configured. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY to enable intelligent responses.)`;
  }

  return `I received your message about: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"\n\n(Note: AI provider is not configured. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY in your environment to enable intelligent responses.)`;
}
