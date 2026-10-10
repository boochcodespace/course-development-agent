import { NextRequest, NextResponse } from 'next/server';
import { loadActiveStyleGuide } from '@/lib/style-guide/active';
import { complete } from '@/lib/ai/provider';
import { composeSystemPrompt, type AttachedMaterial } from '@/lib/ai/system-prompt';
import { getAgentForStage } from '@/lib/ai/agents';
import { loadAgentSpec, loadAgentKnowledge, loadKnowledgeFiles } from '@/lib/agents/loader';
import type { StageId } from '@/lib/types';
import { PIPELINE_STAGES } from '@/lib/types';
import { CONTENT_KNOWLEDGE, type ContentFormat } from '@/lib/content-draft';

const STAGE_KNOWLEDGE_DIRS: Partial<Record<StageId, string | string[]>> = {
  outline: ['course-outline', 'shared'],
  'design-docs': 'shared',
  qa: 'shared',
  'dev-support': 'shared',
};

const VALID_STAGES: StageId[] = PIPELINE_STAGES.map((s) => s.id);

const FORMAT_LABELS: Record<ContentFormat, string> = {
  rise: 'Rise 360 on-screen blocks',
  ilt: 'ILT slides with speaker notes',
};

/** Extra, selectively loaded knowledge for stages that need part of a larger library. */
function loadExtraKnowledge(stageId: StageId, format?: ContentFormat): string {
  if (stageId === 'content-draft' && format) {
    return loadKnowledgeFiles('content-writing', CONTENT_KNOWLEDGE[format]);
  }
  if (stageId === 'dev-support') {
    return loadKnowledgeFiles('rise-spec', ['interaction-types', 'rise-constraints']);
  }
  return '';
}

const ARTIFACT_NAMES: Record<StageId, string> = {
  'needs-analysis': 'Needs Analysis Report',
  'outline': 'Course Outline',
  'design-docs': 'Design Document',
  'qa': 'QA Report',
  'content-draft': 'Content Draft',
  'dev-support': 'Developer Handoff Package',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stageId,
      userPrompt,
      projectTitle,
      courseType,
      targetAudience,
      materials,
      committedStages,
      customKnowledgeBase,
      projectNotes,
      moduleName,
      contentFormat,
    } = body;

    if (!stageId || !VALID_STAGES.includes(stageId)) {
      return NextResponse.json(
        { error: 'Valid stageId is required.' },
        { status: 400 }
      );
    }

    let format: ContentFormat | undefined;
    let moduleLabel = '';
    if (stageId === 'content-draft') {
      if (contentFormat !== 'rise' && contentFormat !== 'ilt') {
        return NextResponse.json({ error: 'Choose a format: Rise 360 or ILT slides.' }, { status: 400 });
      }
      moduleLabel = typeof moduleName === 'string' ? moduleName.trim().slice(0, 200) : '';
      if (!moduleLabel) {
        return NextResponse.json({ error: 'Choose the module to write.' }, { status: 400 });
      }
      format = contentFormat;
    }

    const agent = getAgentForStage(stageId as StageId);
    if (!agent) {
      return NextResponse.json(
        { error: `No agent configured for stage "${stageId}". This stage is not yet available.` },
        { status: 501 }
      );
    }

    const fileSpec = loadAgentSpec(stageId as StageId);
    const knowledgeDir = STAGE_KNOWLEDGE_DIRS[stageId as StageId];
    const knowledgeBase = [
      knowledgeDir ? loadAgentKnowledge(knowledgeDir) : '',
      loadExtraKnowledge(stageId as StageId, format),
    ]
      .filter(Boolean)
      .join('\n\n---\n\n');

    const systemBlockParts = [agent.systemBlock];
    if (fileSpec) systemBlockParts.push(fileSpec);
    if (knowledgeBase) {
      systemBlockParts.push(`## Agent Knowledge Base\n\n${knowledgeBase}`);
    }
    const agentWithSpec = { ...agent, systemBlock: systemBlockParts.join('\n\n') };

    let priorStageContext = '';
    if (committedStages && typeof committedStages === 'object') {
      const entries = Object.entries(committedStages as Record<string, string>);
      if (entries.length > 0) {
        const stageOrder = PIPELINE_STAGES.map((s) => s.id);
        entries.sort(
          (a, b) =>
            stageOrder.indexOf(a[0] as StageId) - stageOrder.indexOf(b[0] as StageId)
        );
        priorStageContext = entries
          .map(([id, markdown]) => {
            const name = ARTIFACT_NAMES[id as StageId] || id;
            return `## Committed artifact: ${name} (${id})\n\n${markdown}`;
          })
          .join('\n\n---\n\n');
      }
    }

    const attachedMaterials: AttachedMaterial[] = Array.isArray(materials)
      ? (materials as AttachedMaterial[])
      : [];

    let priorContextWithNotes = priorStageContext;
    if (Array.isArray(projectNotes) && projectNotes.length > 0) {
      const notesBlock = `## Cross-stage notes from prior chat\n\n${projectNotes
        .map((n: string, i: number) => `${i + 1}. ${n}`)
        .join('\n')}`;
      priorContextWithNotes = priorContextWithNotes
        ? `${notesBlock}\n\n---\n\n${priorContextWithNotes}`
        : notesBlock;
    }

    const styleGuide = await loadActiveStyleGuide();

    const systemPrompt = composeSystemPrompt(
      {
        styleGuide,
        projectTitle,
        courseType,
        targetAudience,
        customKnowledgeBase,
        attachedMaterials,
        analysisReport: priorContextWithNotes || undefined,
      },
      agentWithSpec
    );

    const artifactName = ARTIFACT_NAMES[stageId as StageId];
    const userMessage = stageId === 'content-draft'
      ? `Write the ${artifactName} for this module: ${moduleLabel}\nFormat: ${FORMAT_LABELS[format as ContentFormat]}.${userPrompt ? `\n\nAdditional guidance from the user:\n\n${userPrompt}` : ''}`
      : userPrompt
      ? `Generate a ${artifactName} for this project. Additional guidance from the user:\n\n${userPrompt}`
      : `Generate a comprehensive ${artifactName} for this project based on all available source materials, project context, and prior committed artifacts.`;

    const result = await complete({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
      temperature: agentWithSpec.temperature,
      maxTokens: agentWithSpec.maxTokens,
    });

    return NextResponse.json({
      artifactMarkdown: result.content,
      provider: result.provider,
      model: result.model,
      usage: result.usage,
      cached: result.cached,
      truncated: result.truncated ?? false,
    });
  } catch (err) {
    console.error('[stages/generate] Error:', err);

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const isKeyMissing = errorMessage === 'NO_API_KEY';

    return NextResponse.json(
      {
        error: isKeyMissing
          ? 'No API key configured. Add one in Settings, then try again.'
          : `Generation failed: ${errorMessage}`,
      },
      { status: isKeyMissing ? 401 : 500 }
    );
  }
}
