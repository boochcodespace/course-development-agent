'use client';

import React, { useState, useCallback, useEffect } from 'react';
import MarkdownView from '@/components/ui/MarkdownView';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import CommitModal from './CommitModal';
import ChatRevisionDiff from './ChatRevisionDiff';
import type { StageId, ProjectStage, StageArtifactVersion } from '@/lib/types';
import ContentDraftControls from './ContentDraftControls';
import AlignmentMap from '@/components/outline/AlignmentMap';
import {
  listDrafts,
  parseOutlineModules,
  upsertModuleDraft,
  type ContentFormat,
} from '@/lib/content-draft';
import { PIPELINE_STAGES as STAGES } from '@/lib/types';

interface StageCanvasProps {
  projectId: string;
  stageId: StageId;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  'not-started': { label: 'Not started', color: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300' },
  'in-progress': { label: 'In progress', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  'committed': { label: 'Committed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  'unlocked': { label: 'Unlocked for editing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
};

export default function StageCanvas({ projectId, stageId }: StageCanvasProps) {
  const projects = useAppStore((s) => s.projects);
  const allMaterials = useAppStore((s) => s.materials);
  const setStageStatus = useAppStore((s) => s.setStageStatus);
  const setStageArtifact = useAppStore((s) => s.setStageArtifact);
  const commitStage = useAppStore((s) => s.commitStage);
  const unlockStage = useAppStore((s) => s.unlockStage);
  const isStageAvailable = useAppStore((s) => s.isStageAvailable);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const userSettings = useAppStore((s) => s.userSettings);

  const project = projects.find((p) => p.id === projectId);
  const stage = project?.stages?.find((s) => s.id === stageId) || null;
  const stageDef = STAGES.find((s) => s.id === stageId);
  const available = isStageAvailable(projectId, stageId);

  const [markdown, setMarkdown] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);
  const [regenGuidance, setRegenGuidance] = useState('');
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);
  const [diffDismissed, setDiffDismissed] = useState(false);
  const [outlineView, setOutlineView] = useState<'document' | 'map'>('document');

  const projectMaterials = allMaterials.filter((m) => m.projectId === projectId);

  // Content Draft only: the modules in the committed outline, and what is drafted so far.
  const committedOutline = (() => {
    const versions = project?.stages?.find((s) => s.id === 'outline')?.versions ?? [];
    const committed = versions.filter((v) => v.committedAt !== null);
    if (committed.length === 0) return '';
    return committed.reduce((a, b) => (a.version >= b.version ? a : b)).artifactMarkdown;
  })();
  const outlineModules = stageId === 'content-draft' ? parseOutlineModules(committedOutline) : [];
  const drafts = stageId === 'content-draft' ? listDrafts(markdown) : [];

  useEffect(() => {
    if (!stage) return;
    const currentArtifact = getCurrentArtifact(stage);
    // A stage with no artifact yet starts empty. Without this, the previous
    // stage's text carries over into the new stage's editor state.
    setMarkdown(currentArtifact ? currentArtifact.artifactMarkdown : '');
    setDiffDismissed(false);
  }, [stage?.currentVersion, stage?.status, stageId]);

  // Clear the truncation warning when the user switches stages.
  useEffect(() => {
    setTruncated(false);
  }, [stageId]);

  function getCurrentArtifact(s: ProjectStage): StageArtifactVersion | null {
    if (s.versions.length === 0) return null;
    return s.versions[s.versions.length - 1];
  }

  function getCommittedVersions(s: ProjectStage): StageArtifactVersion[] {
    return s.versions.filter((v) => v.committedAt !== null);
  }

  const handleGenerate = useCallback(async (guidance?: string, draft?: { module: string; format: ContentFormat }) => {
    if (!project || !stage) return;
    if (stageId === 'content-draft' && !draft) return;

    setGenerating(true);
    setGenerateError(null);
    setTruncated(false);
    setShowRegenPrompt(false);
    setRegenGuidance('');

    try {
      const materialsPayload = projectMaterials
        .filter((m) => m.extractedText)
        .map((m) => ({ id: m.id, name: m.name, text: m.extractedText! }));

      const committedStages: Record<string, string> = {};
      if (project.stages) {
        for (const s of project.stages) {
          if (s.id === stageId) break;
          const committedVersions = s.versions.filter((v) => v.committedAt !== null);
          if (committedVersions.length > 0) {
            const latest = committedVersions.reduce((a, b) =>
              a.version >= b.version ? a : b
            );
            committedStages[s.id] = latest.artifactMarkdown;
          }
        }
      }

      const res = await fetch('/api/stages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId,
          userPrompt: guidance || undefined,
          projectTitle: project.title,
          courseType: project.courseType,
          targetAudience: project.targetAudience,
          materials: materialsPayload,
          committedStages,
          customKnowledgeBase: userSettings.claudeMdContent,
          ...(draft ? { moduleName: draft.module, contentFormat: draft.format } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || 'Generation failed. Please try again.');
        return;
      }

      const generated = data.artifactMarkdown || '';
      const newMarkdown = draft
        ? upsertModuleDraft(markdown, draft.module, draft.format, generated)
        : generated;
      setMarkdown(newMarkdown);
      setStageArtifact(projectId, stageId, newMarkdown);
      setTruncated(!!data.truncated);
      setIsEditing(true);
    } catch {
      setGenerateError('Could not reach the server. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  }, [project, stage, projectMaterials, stageId, projectId, userSettings.claudeMdContent, setStageArtifact, markdown]);

  const handleCommit = useCallback((authorNote: string) => {
    commitStage(projectId, stageId, markdown, {}, authorNote || undefined);
    setViewingVersion(null);

    const currentIdx = STAGES.findIndex((s) => s.id === stageId);
    if (currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1];
      const viewMap: Record<string, string> = {
        'outline': 'outline',
        'design-docs': 'design-doc',
        'qa': 'quality-assurance',
        'content-draft': 'content-draft',
        'dev-support': 'development',
      };
      const nextView = viewMap[nextStage.id];
      if (nextView) {
        setActiveView(nextView as Parameters<typeof setActiveView>[0]);
      }
    }
  }, [projectId, stageId, markdown, commitStage, setActiveView]);

  const handleUnlock = useCallback(() => {
    unlockStage(projectId, stageId);
    setShowUnlockConfirm(false);
    setViewingVersion(null);
  }, [projectId, stageId, unlockStage]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (project?.title || 'project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project';
    a.download = `${stageId}-${slug}-v${stage?.currentVersion || 0}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown, stageId, stage?.currentVersion, project?.title]);

  if (!project || !stage) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-sm text-surface-500">Stage not found.</p>
      </div>
    );
  }

  if (!available) {
    const deps = stageDef?.dependsOn || [];
    const depLabels = deps.map((d) => STAGES.find((s) => s.id === d)?.label || d);
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
            {stageDef?.label || stageId}
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Commit {depLabels.join(' and ')} first to unlock this stage.
          </p>
        </div>
      </div>
    );
  }

  const committedVersions = getCommittedVersions(stage);
  const hasDownstreamCommitted = project.stages
    .slice(project.stages.findIndex((s) => s.id === stageId) + 1)
    .some((s) => s.status === 'committed');

  const currentArtifact = getCurrentArtifact(stage);
  const isChatRevision =
    !!currentArtifact &&
    currentArtifact.committedAt === null &&
    currentArtifact.chatRevision === true;
  const latestCommittedArtifact =
    committedVersions.length > 0
      ? committedVersions.reduce((a, b) => (a.version >= b.version ? a : b))
      : null;
  const showChatDiff =
    isChatRevision && !diffDismissed && latestCommittedArtifact !== null;

  const viewingArtifact = viewingVersion !== null
    ? committedVersions.find((v) => v.version === viewingVersion)
    : null;
  const isViewingHistory = viewingArtifact !== null;

  const statusBadge = STATUS_BADGE[stage.status] || STATUS_BADGE['not-started'];

  return (
    <div className="flex h-full">
      {/* Main editor pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              {stageDef?.label || stageId}
            </h2>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusBadge.color)}>
              {statusBadge.label}
            </span>
            {stage.stale && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Stale
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {stageId === 'outline' && stage.status !== 'not-started' && markdown && (
              <div className="inline-flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden" role="tablist" aria-label="Outline view">
                {(['document', 'map'] as const).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={outlineView === v}
                    onClick={() => setOutlineView(v)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium transition-colors',
                      outlineView === v
                        ? 'bg-brand-600 text-white'
                        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    )}
                  >
                    {v === 'document' ? 'Document' : 'Alignment map'}
                  </button>
                ))}
              </div>
            )}
            {stage.status !== 'not-started' && markdown && !(stageId === 'outline' && outlineView === 'map') && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
              >
                {isEditing ? 'Preview' : 'Edit'}
              </button>
            )}
          </div>
        </div>

        {/* Generation error */}
        {generateError && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{generateError}</p>
          </div>
        )}

        {/* Truncation warning */}
        {truncated && !generating && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This draft hit the model's output limit and might be cut off at the end.
              Review the ending before committing, or regenerate with guidance to tighten the scope.
            </p>
          </div>
        )}

        {/* History viewing banner */}
        {isViewingHistory && viewingArtifact && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Viewing version {viewingArtifact.version} (read-only)
              {viewingArtifact.authorNote && (
                <span className="block text-xs mt-0.5 text-blue-600 dark:text-blue-400">
                  Note: {viewingArtifact.authorNote}
                </span>
              )}
            </p>
            <button
              onClick={() => setViewingVersion(null)}
              className="px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
            >
              Back to current
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {stageId === 'content-draft' && stage.status !== 'committed' && !isViewingHistory && (
            <div className="p-6 pb-0 max-w-4xl mx-auto">
              <ContentDraftControls
                modules={outlineModules}
                drafts={drafts}
                generating={generating}
                onDraft={(module, format, guidance) => handleGenerate(guidance, { module, format })}
              />
            </div>
          )}

          {stage.status === 'not-started' && !generating && stageId !== 'content-draft' && (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <div className="text-center max-w-lg px-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
                  Ready to generate
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">
                  The agent will analyze your {projectMaterials.filter((m) => m.extractedText).length} source
                  {projectMaterials.filter((m) => m.extractedText).length === 1 ? ' material' : ' materials'} and
                  produce a draft {stageDef?.label || 'artifact'}.
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mb-6">
                  You can edit the draft freely, regenerate with guidance, or commit it when ready.
                </p>
                <button
                  onClick={() => handleGenerate()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  Generate {stageDef?.label || 'draft'}
                </button>
              </div>
            </div>
          )}

          {generating && (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Generating draft...</p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">This might take 30 to 60 seconds.</p>
              </div>
            </div>
          )}

          {!generating && stageId === 'outline' && outlineView === 'map' && markdown && (
            <AlignmentMap markdown={isViewingHistory && viewingArtifact ? viewingArtifact.artifactMarkdown : markdown} />
          )}

          {!generating && !(stageId === 'outline' && outlineView === 'map') && (stage.status !== 'not-started' || markdown) && (
            <div className="p-6 max-w-4xl mx-auto">
              {isViewingHistory && viewingArtifact ? (
                <MarkdownView showFrontMatter={false}>{viewingArtifact.artifactMarkdown}</MarkdownView>
              ) : isEditing ? (
                <textarea
                  value={markdown}
                  onChange={(e) => {
                    setMarkdown(e.target.value);
                    if (stage.status === 'committed') return;
                    setStageArtifact(projectId, stageId, e.target.value);
                  }}
                  className="w-full h-[calc(100vh-14rem)] p-4 text-sm font-mono leading-relaxed bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Your artifact content will appear here after generation."
                  readOnly={stage.status === 'committed'}
                />
              ) : (
                <MarkdownView showFrontMatter={false}>{markdown}</MarkdownView>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex flex-col overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Chat revision diff */}
          {showChatDiff && latestCommittedArtifact && currentArtifact && (
            <ChatRevisionDiff
              priorMarkdown={latestCommittedArtifact.artifactMarkdown}
              currentMarkdown={currentArtifact.artifactMarkdown}
              changeDescription={
                currentArtifact.chatChangeDescription || 'Targeted revision from chat'
              }
              onDismiss={() => setDiffDismissed(true)}
            />
          )}

          {/* Status section */}
          <div>
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-600 dark:text-surface-400">Stage</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusBadge.color)}>
                  {statusBadge.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-600 dark:text-surface-400">Version</span>
                <span className="text-xs font-medium text-surface-900 dark:text-surface-100">
                  {stage.currentVersion || 0}
                </span>
              </div>
              {stage.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-600 dark:text-surface-400">Last updated</span>
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {new Date(stage.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions section */}
          <div>
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">Actions</h3>
            <div className="space-y-2">
              {/* Commit button */}
              {(stage.status === 'in-progress' || stage.status === 'unlocked') && markdown.trim() && (
                <button
                  onClick={() => setShowCommitModal(true)}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Commit {stageDef?.label || 'stage'}
                </button>
              )}

              {/* Regenerate button */}
              {(stage.status === 'in-progress' || stage.status === 'unlocked') && stageId !== 'content-draft' && (
                <>
                  {showRegenPrompt ? (
                    <div className="space-y-2">
                      <textarea
                        value={regenGuidance}
                        onChange={(e) => setRegenGuidance(e.target.value)}
                        placeholder="Optional: What should the agent focus on or change?"
                        rows={3}
                        className="w-full px-2.5 py-2 text-xs border border-surface-300 dark:border-surface-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerate(regenGuidance || undefined)}
                          disabled={generating}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Regenerate {stageDef?.label || 'draft'}
                        </button>
                        <button
                          onClick={() => { setShowRegenPrompt(false); setRegenGuidance(''); }}
                          className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRegenPrompt(true)}
                      disabled={generating}
                      className="w-full px-3 py-2 text-sm font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      Regenerate {stageDef?.label || 'draft'}
                    </button>
                  )}
                </>
              )}

              {/* Unlock button */}
              {stage.status === 'committed' && (
                <>
                  {showUnlockConfirm ? (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Editing this stage might invalidate downstream stages that depend on it.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUnlock}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                        >
                          Unlock
                        </button>
                        <button
                          onClick={() => setShowUnlockConfirm(false)}
                          className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowUnlockConfirm(true)}
                      className="w-full px-3 py-2 text-xs font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors text-left"
                    >
                      Unlock to edit
                    </button>
                  )}
                </>
              )}

              {/* Download button */}
              {markdown.trim() && (
                <button
                  onClick={handleDownload}
                  className="w-full px-3 py-2 text-xs font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Markdown
                </button>
              )}
            </div>
          </div>

          {/* Version history */}
          {committedVersions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                Version history
              </h3>
              <div className="space-y-1">
                {committedVersions.slice().reverse().map((v) => (
                  <button
                    key={v.version}
                    onClick={() => setViewingVersion(viewingVersion === v.version ? null : v.version)}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-lg transition-colors text-xs',
                      viewingVersion === v.version
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Version {v.version}</span>
                      <span className="text-surface-400 dark:text-surface-500">
                        {v.committedAt ? new Date(v.committedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {v.authorNote && (
                      <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5 truncate">
                        {v.authorNote}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source materials count */}
          <div>
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
              Source materials
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              {projectMaterials.filter((m) => m.extractedText).length} extracted materials available
            </p>
            {projectMaterials.filter((m) => m.extractedText).length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Upload source materials in the Source Library for better results.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Commit modal */}
      <CommitModal
        open={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        onCommit={handleCommit}
        stageLabel={stageDef?.label || stageId}
        hasDownstreamCommitted={hasDownstreamCommitted}
      />
    </div>
  );
}
