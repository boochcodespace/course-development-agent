'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import ADDIEProgress from '@/components/projects/ADDIEProgress';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import MaterialCard from '@/components/materials/MaterialCard';
import MaterialUpload from '@/components/materials/MaterialUpload';
import type { Material, PipelineActionPayload, StageId } from '@/lib/types';
import MaterialViewer from '@/components/materials/MaterialViewer';
import Button from '@/components/ui/Button';
import StageCanvas from '@/components/stages/StageCanvas';
import RiseSpecTool from '@/components/tools/RiseSpecTool';
import KnowledgeBase from '@/components/knowledge/KnowledgeBase';
import SettingsPanel from '@/components/settings/SettingsPanel';
import WorkflowProgress from '@/components/workflow/WorkflowProgress';

function DashboardView() {
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Course Development Dashboard</h1>
          <p className="text-sm text-surface-600 mt-1">
            Manage your instructional design projects with AI guidance
          </p>
        </div>
        <Button onClick={() => setShowNewProject(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Active projects */}
      <section>
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Active Projects ({projects.filter((p) => p.status === 'active').length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects
            .filter((p) => p.status === 'active')
            .map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(id) => setActiveProject(id)}
              />
            ))}
        </div>
      </section>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-12 w-12 text-surface-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <h3 className="text-lg font-medium text-surface-700 mb-1">No projects yet</h3>
          <p className="text-sm text-surface-500 mb-4">
            Create your first course development project to get started.
          </p>
          <Button onClick={() => setShowNewProject(true)}>Create Project</Button>
        </div>
      )}

      <NewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
    </div>
  );
}

const MAX_CONTEXT_CHARS = 240_000; // ~60k tokens at 4 chars/token

function ChatView() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const projects = useAppStore((s) => s.projects);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const allMaterials = useAppStore((s) => s.materials);
  const getAnalysisWizard = useAppStore((s) => s.getAnalysisWizard);
  const userSettings = useAppStore((s) => s.userSettings);
  const setStageArtifactFromChat = useAppStore((s) => s.setStageArtifactFromChat);
  const setStageArtifact = useAppStore((s) => s.setStageArtifact);
  const [sending, setSending] = useState(false);
  const [attachedMaterials, setAttachedMaterials] = useState<Material[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;
  const projectMessages = messages.filter((m) => m.projectId === activeProjectId);
  const projectMaterials = allMaterials.filter((m) => m.projectId === activeProjectId);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages.length]);

  // All hooks must run before this conditional return (Rules of Hooks).
  if (!activeProject) return null;

  const toggleAttachment = (mat: Material) => {
    setAttachedMaterials((prev) =>
      prev.some((m) => m.id === mat.id) ? prev.filter((m) => m.id !== mat.id) : [...prev, mat]
    );
  };

  const removeAttachment = (id: string) => {
    setAttachedMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSend = async (content: string) => {
    const materialIds = attachedMaterials.map((m) => m.id);
    setAttachedMaterials([]);
    setShowPicker(false);

    addMessage({
      projectId: activeProjectId!,
      role: 'user',
      content,
      attachments: materialIds.length > 0 ? materialIds : undefined,
    });

    setSending(true);

    try {
      const wizard = getAnalysisWizard(activeProjectId!);
      const history = projectMessages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const attachedMaterialsPayload = attachedMaterials
        .filter((m) => m.extractedText)
        .map((m) => ({ id: m.id, name: m.name, text: m.extractedText! }));

      const pipelineContext = {
        stages: activeProject.stages,
        projectName: activeProject.title,
        projectNotes: activeProject.projectNotes,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          projectId: activeProjectId,
          phase: activeProject.currentPhase,
          history,
          projectTitle: activeProject.title,
          courseType: activeProject.courseType,
          targetAudience: activeProject.targetAudience,
          analysisReport: wizard?.report?.executiveSummary,
          attachedMaterials: attachedMaterialsPayload,
          customKnowledgeBase: userSettings.claudeMdContent,
          pipelineContext,
        }),
      });

      const data = await response.json();
      const pipelineAction = data.pipelineAction as PipelineActionPayload | null | undefined;

      const truncationNote = data.truncated
        ? '\n\nNote: this response hit the output limit and might be incomplete.'
        : '';
      addMessage({
        projectId: activeProjectId!,
        role: 'assistant',
        content: (data.content || data.error || 'No response received.') + truncationNote,
      });

      if (pipelineAction && pipelineAction.type === 'modify' && pipelineAction.revisedMarkdown) {
        setStageArtifactFromChat(
          activeProjectId!,
          pipelineAction.stageId,
          pipelineAction.revisedMarkdown,
          pipelineAction.changeDescription || 'Revision from chat'
        );
        addMessage({
          projectId: activeProjectId!,
          role: 'assistant',
          content: '',
          pipelineAction,
        });
      } else if (pipelineAction && pipelineAction.type === 'generate') {
        await runPipelineGenerate(activeProjectId!, pipelineAction, activeProject);
      }
    } catch {
      addMessage({
        projectId: activeProjectId!,
        role: 'assistant',
        content: 'Failed to reach the AI service. Check your network connection and API key configuration.',
      });
    } finally {
      setSending(false);
    }
  };

  const runPipelineGenerate = async (
    projectId: string,
    action: PipelineActionPayload,
    project: typeof activeProject
  ) => {
    if (!project) return;
    const stageId = action.stageId as StageId;
    const projectMats = allMaterials.filter((m) => m.projectId === projectId);
    const materialsPayload = projectMats
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

    try {
      const res = await fetch('/api/stages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId,
          userPrompt: action.userPrompt,
          projectTitle: project.title,
          courseType: project.courseType,
          targetAudience: project.targetAudience,
          materials: materialsPayload,
          committedStages,
          customKnowledgeBase: userSettings.claudeMdContent,
          projectNotes: project.projectNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addMessage({
          projectId,
          role: 'assistant',
          content: `Could not generate the ${stageId} draft: ${data.error || 'Unknown error'}.`,
        });
        return;
      }
      const newMarkdown = data.artifactMarkdown || '';
      setStageArtifact(projectId, stageId, newMarkdown);
      addMessage({
        projectId,
        role: 'assistant',
        content: '',
        pipelineAction: action,
      });
    } catch {
      addMessage({
        projectId,
        role: 'assistant',
        content: `Could not reach the server while generating the ${stageId} draft. Check your connection and try again.`,
      });
    }
  };

  const availableForPicker = projectMaterials.filter((m) => m.extractedText);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Project info bar */}
      <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center gap-4">
        <ADDIEProgress
          phaseProgress={activeProject.phaseProgress}
          currentPhase={activeProject.currentPhase}
          compact
        />
      </div>

      {/* Context indicator */}
      {attachedMaterials.length > 0 && (
        <div className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border-b border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300">
          <span className="font-medium">{attachedMaterials.length} {attachedMaterials.length === 1 ? 'material' : 'materials'} in context:</span>{' '}
          {attachedMaterials.map((m) => m.name).join(', ')}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {projectMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached material chips */}
      {attachedMaterials.length > 0 && (
        <div className="px-4 pt-2 flex flex-wrap gap-2 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800">
          {attachedMaterials.map((mat) => (
            <span
              key={mat.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {mat.name.length > 30 ? mat.name.slice(0, 30) + '...' : mat.name}
              <button
                onClick={() => removeAttachment(mat.id)}
                className="ml-0.5 text-brand-500 hover:text-brand-700 dark:hover:text-brand-200"
                aria-label={`Remove ${mat.name}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Material picker popover */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-20 left-4 z-50 w-80 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-xl"
        >
          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">Source library</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Select materials to include as context</p>
          </div>
          {availableForPicker.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-surface-500 dark:text-surface-400">
              No extracted materials in this project yet.<br />
              <span className="text-xs">Upload files in Source Library first.</span>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-700">
              {availableForPicker.map((mat) => {
                const selected = attachedMaterials.some((m) => m.id === mat.id);
                return (
                  <li key={mat.id}>
                    <button
                      onClick={() => toggleAttachment(mat)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-left"
                    >
                      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected ? 'bg-brand-600 border-brand-600' : 'border-surface-300 dark:border-surface-500'}`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{mat.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{mat.type} &middot; {Math.round((mat.extractedText?.length || 0) / 1000)}k chars</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={sending}
        onAttachClick={() => setShowPicker((v) => !v)}
        attachCount={attachedMaterials.length}
      />
    </div>
  );
}

function ProjectMaterialsView({ projectId }: { projectId: string }) {
  const allMaterials = useAppStore((s) => s.materials);
  const deleteMaterial = useAppStore((s) => s.deleteMaterial);
  const updateMaterial = useAppStore((s) => s.updateMaterial);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const materials = allMaterials.filter((m) => m.projectId === projectId);

  const handleReExtract = async (mat: Material) => {
    const previousText = mat.extractedText;
    updateMaterial(mat.id, { extractedText: undefined });
    try {
      const res = await fetch(`/api/materials/reextract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: mat.id, filePath: mat.filePath }),
      });
      if (res.ok) {
        const data = await res.json();
        updateMaterial(mat.id, { extractedText: data.extractedText });
      } else {
        updateMaterial(mat.id, { extractedText: previousText });
      }
    } catch {
      updateMaterial(mat.id, { extractedText: previousText });
    }
  };

  const fileTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: 'PDF',
      docx: 'DOC',
      pptx: 'PPT',
      xlsx: 'XLS',
      txt: 'TXT',
      md: 'MD',
      rtf: 'RTF',
      image: 'IMG',
    };
    return icons[type] || type.toUpperCase().slice(0, 3);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Source library</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {materials.length} {materials.length === 1 ? 'file' : 'files'} uploaded to this project
          </p>
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload files
        </button>
      </div>

      {showUpload && (
        <div className="mb-6 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <MaterialUpload projectId={projectId} onUploadComplete={() => setShowUpload(false)} />
        </div>
      )}

      {materials.length === 0 && (
        <div className="text-center py-16">
          <svg className="mx-auto h-10 w-10 text-surface-300 dark:text-surface-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">No files yet</p>
          <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">Upload SME notes, PDFs, slide decks, and research documents.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            Upload your first file
          </button>
        </div>
      )}

      <div className="space-y-3">
        {materials.map((mat) => {
          const extractionStatus = mat.extractedText ? 'extracted' : 'no-text';
          return (
            <div
              key={mat.id}
              className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{fileTypeIcon(mat.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{mat.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {mat.originalName} &middot; {formatSize(mat.size)} &middot; {new Date(mat.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${extractionStatus === 'extracted' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'}`}>
                      {extractionStatus === 'extracted' ? `Extracted (${Math.round((mat.extractedText?.length || 0) / 1000)}k chars)` : 'No text extracted'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {mat.extractedText && (
                    <button
                      onClick={() => setExpandedId(expandedId === mat.id ? null : mat.id)}
                      className="p-1.5 text-xs text-surface-500 dark:text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                      title="Preview extracted text"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleReExtract(mat)}
                    className="p-1.5 text-xs text-surface-500 dark:text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                    title="Re-extract text"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {confirmDeleteId === mat.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteMaterial(mat.id); setConfirmDeleteId(null); }}
                        className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(mat.id)}
                      className="p-1.5 text-xs text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove material"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {expandedId === mat.id && mat.extractedText && (
                <div className="px-4 pb-4">
                  <pre className="text-xs text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-900 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {mat.extractedText.slice(0, 2000)}{mat.extractedText.length > 2000 ? '\n\n[Preview truncated. Full text will be used when attached to a chat message.]' : ''}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaterialsView() {
  const materials = useAppStore((s) => s.materials);
  const selectedMaterialId = useAppStore((s) => s.selectedMaterialId);
  const setSelectedMaterial = useAppStore((s) => s.setSelectedMaterial);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Source Materials</h1>
          <p className="text-sm text-surface-600 mt-1">
            Upload and manage materials for your course projects
          </p>
        </div>
        <p className="text-sm text-surface-500 max-w-xs text-right">
          Open a project to upload materials. Each project keeps its own source library.
        </p>
      </div>


      {/* Materials list */}
      <div className="space-y-3">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onSelect={(id) => setSelectedMaterial(id)}
            isSelected={material.id === selectedMaterialId}
          />
        ))}
      </div>

      {/* Empty state */}
      {materials.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-12 w-12 text-surface-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <h3 className="text-lg font-medium text-surface-700 mb-1">No materials uploaded</h3>
          <p className="text-sm text-surface-500">
            Open or create a project, then upload SME content, reference materials, or existing courses.
          </p>
        </div>
      )}

      {/* Material viewer panel */}
      {selectedMaterialId && <MaterialViewer />}
    </div>
  );
}

export default function Home() {
  const activeView = useAppStore((s) => s.activeView);
  const activeProjectId = useAppStore((s) => s.activeProjectId);

  const renderProjectView = () => {
    if (!activeProjectId) return null;

    const viewContent = (() => {
      switch (activeView) {
        case 'analysis':
          return <StageCanvas projectId={activeProjectId} stageId="needs-analysis" />;
        case 'outline':
          return <StageCanvas projectId={activeProjectId} stageId="outline" />;
        case 'design-doc':
          return <StageCanvas projectId={activeProjectId} stageId="design-docs" />;
        case 'quality-assurance':
          return <StageCanvas projectId={activeProjectId} stageId="qa" />;
        case 'interactive-spec':
          return <RiseSpecTool projectId={activeProjectId} />;
        case 'content-draft':
          return <StageCanvas projectId={activeProjectId} stageId="content-draft" />;
        case 'development':
          return <StageCanvas projectId={activeProjectId} stageId="dev-support" />;
        case 'materials':
          return <ProjectMaterialsView projectId={activeProjectId} />;
        case 'chat':
        default:
          return <ChatView />;
      }
    })();

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {activeView !== 'chat' && (
          <WorkflowProgress projectId={activeProjectId} variant="horizontal" />
        )}
        <div className="flex-1 overflow-y-auto">
          {viewContent}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      {activeView === 'knowledge-base' && <KnowledgeBase />}
      {activeView === 'settings' && <SettingsPanel />}
      {activeView !== 'knowledge-base' && activeView !== 'settings' && !activeProjectId && activeView === 'dashboard' && <DashboardView />}
      {activeView !== 'knowledge-base' && activeView !== 'settings' && !activeProjectId && activeView === 'materials' && <MaterialsView />}
      {activeView !== 'knowledge-base' && activeView !== 'settings' && activeProjectId && renderProjectView()}
    </AppShell>
  );
}
