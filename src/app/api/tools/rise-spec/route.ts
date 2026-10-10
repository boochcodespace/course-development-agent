import { NextRequest, NextResponse } from 'next/server';
import { complete } from '@/lib/ai/provider';
import { composeSystemPrompt } from '@/lib/ai/system-prompt';
import { RISE_SPEC_AGENT } from '@/lib/ai/agents';
import { loadKnowledgeFiles, loadToolAgentSpec } from '@/lib/agents/loader';
import { loadActiveStyleGuide } from '@/lib/style-guide/active';
import {
  INTERACTION_TYPES,
  RISE_SPEC_CORE_KNOWLEDGE,
  buildRiseSpecMessage,
  validateRiseSpecRequest,
  type RiseSpecRequest,
} from '@/lib/rise-spec';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RiseSpecRequest>;

    const problem = validateRiseSpecRequest(body);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }
    const req = body as RiseSpecRequest;

    const knowledgeNames = [
      ...RISE_SPEC_CORE_KNOWLEDGE,
      `lms-${req.lmsProfile}`,
      ...(req.includeResearch ? ['learning-science'] : []),
    ];
    const knowledge = loadKnowledgeFiles('rise-spec', knowledgeNames);
    const spec = loadToolAgentSpec('rise-spec');

    const systemBlock = [
      RISE_SPEC_AGENT.systemBlock,
      spec,
      knowledge ? `## Agent Knowledge Base\n\n${knowledge}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const styleGuide = await loadActiveStyleGuide();
    const systemPrompt = composeSystemPrompt(
      { styleGuide },
      { ...RISE_SPEC_AGENT, systemBlock }
    );

    const interactionLabel = INTERACTION_TYPES.find((t) => t.id === req.interactionPreference)?.label;

    const result = await complete({
      messages: [{ role: 'user', content: buildRiseSpecMessage(req, interactionLabel) }],
      systemPrompt,
      temperature: RISE_SPEC_AGENT.temperature,
      maxTokens: RISE_SPEC_AGENT.maxTokens,
    });

    return NextResponse.json({
      specMarkdown: result.content,
      provider: result.provider,
      model: result.model,
      usage: result.usage,
      truncated: result.truncated ?? false,
    });
  } catch (err) {
    console.error('[tools/rise-spec] POST error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isKeyMissing = message === 'NO_API_KEY';
    return NextResponse.json(
      {
        error: isKeyMissing
          ? 'No API key configured. Add one in Settings, then try again.'
          : `Spec generation failed: ${message}`,
      },
      { status: isKeyMissing ? 401 : 500 }
    );
  }
}
