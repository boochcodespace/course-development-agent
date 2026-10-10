'use client';

import { useEffect, useMemo, useState } from 'react';
import MarkdownView from '@/components/ui/MarkdownView';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  DEFAULT_LMS_PROFILE,
  INTERACTION_TYPES,
  LMS_PROFILES,
  MAX_FIELD,
  checkObjective,
} from '@/lib/rise-spec';

interface RiseSpecToolProps {
  projectId: string;
}

const STORAGE_PREFIX = 'lxp-rise-spec:';

const CHECK_STYLES = {
  ok: 'text-green-700 dark:text-green-400',
  low: 'text-amber-700 dark:text-amber-300',
  vague: 'text-red-700 dark:text-red-400',
  missing: 'text-surface-500 dark:text-surface-400',
} as const;

function readSaved(projectId: string): string {
  try {
    return localStorage.getItem(STORAGE_PREFIX + projectId) ?? '';
  } catch {
    return '';
  }
}

function writeSaved(projectId: string, value: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + projectId, value);
  } catch {
    // storage can be unavailable (private windows, blocked site data)
  }
}

/**
 * A guided form that writes a build spec for one custom interactive component
 * (for example a Rise 360 Code Block). It writes the spec only, never the code.
 */
export default function RiseSpecTool({ projectId }: RiseSpecToolProps) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === projectId));
  const allMaterials = useAppStore((s) => s.materials);
  const materials = allMaterials.filter((m) => m.projectId === projectId && m.extractedText);

  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [persona, setPersona] = useState(project?.targetAudience ?? '');
  const [source, setSource] = useState('');
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [interaction, setInteraction] = useState('');
  const [lmsProfile, setLmsProfile] = useState(DEFAULT_LMS_PROFILE);
  const [brandTokens, setBrandTokens] = useState('');
  const [includeResearch, setIncludeResearch] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [spec, setSpec] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [view, setView] = useState<'preview' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSpec(readSaved(projectId));
  }, [projectId]);

  const objectiveCheck = useMemo(() => checkObjective(objective), [objective]);
  const canSubmit =
    !generating &&
    topic.trim() &&
    objective.trim() &&
    persona.trim() &&
    objectiveCheck.level !== 'vague';

  const toggleMaterial = (id: string) =>
    setAttachedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setTruncated(false);
    try {
      const attached = materials
        .filter((m) => attachedIds.includes(m.id))
        .map((m) => `--- ${m.name} ---\n${m.extractedText}`)
        .join('\n\n');
      const sourceContent = [source.trim(), attached].filter(Boolean).join('\n\n').slice(0, MAX_FIELD.source);

      const res = await fetch('/api/tools/rise-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          objective,
          persona,
          sourceContent: sourceContent || undefined,
          interactionPreference: interaction || undefined,
          lmsProfile,
          brandTokens: brandTokens.trim() || undefined,
          includeResearch,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Spec generation failed. Please try again.');
        return;
      }
      const markdown: string = data.specMarkdown || '';
      setSpec(markdown);
      writeSaved(projectId, markdown);
      setTruncated(!!data.truncated);
      setView('preview');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. Select the Markdown view and copy it by hand.');
    }
  };

  const handleDownload = () => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'component';
    const blob = new Blob([spec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RISE-${slug}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const field =
    'w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100';
  const label = 'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Interactive spec</h1>
        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 max-w-2xl">
          Describe one learning moment that a stock Rise 360 block can&apos;t handle. The agent writes a build spec dense enough for a developer to build from. It writes the spec only, not the code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label htmlFor="rs-topic" className={label}>Topic</label>
            <input id="rs-topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={MAX_FIELD.topic}
              placeholder="What is this component teaching?" className={field} />
          </div>

          <div>
            <label htmlFor="rs-objective" className={label}>Learning objective</label>
            <textarea id="rs-objective" rows={2} value={objective} onChange={(e) => setObjective(e.target.value)}
              maxLength={MAX_FIELD.objective}
              placeholder="Apply the four refund approval rules to three customer disputes."
              aria-describedby="rs-objective-check" className={cn(field, 'resize-none')} />
            <p id="rs-objective-check" role="status" aria-live="polite"
              className={cn('text-xs mt-1 min-h-[1rem]', CHECK_STYLES[objectiveCheck.level])}>
              {objective.trim() ? objectiveCheck.message : 'One objective, with an Apply-level verb or higher.'}
            </p>
          </div>

          <div>
            <label htmlFor="rs-persona" className={label}>Learner role and context</label>
            <textarea id="rs-persona" rows={3} value={persona} onChange={(e) => setPersona(e.target.value)}
              maxLength={MAX_FIELD.persona}
              placeholder="A support agent handling an escalated refund who needs to decide within two minutes."
              className={cn(field, 'resize-none')} />
          </div>

          <div>
            <label htmlFor="rs-source" className={label}>Source content (optional)</label>
            <textarea id="rs-source" rows={3} value={source} onChange={(e) => setSource(e.target.value)}
              placeholder="Paste SME notes, a transcript, or the relevant outline section."
              className={cn(field, 'resize-none')} />
            {materials.length > 0 && (
              <fieldset className="mt-2">
                <legend className="text-xs text-surface-500 dark:text-surface-400 mb-1">Or attach from your source library</legend>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {materials.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-xs text-surface-700 dark:text-surface-300">
                      <input type="checkbox" checked={attachedIds.includes(m.id)} onChange={() => toggleMaterial(m.id)} />
                      <span className="truncate">{m.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="rs-interaction" className={label}>Interaction type</label>
              <select id="rs-interaction" value={interaction} onChange={(e) => setInteraction(e.target.value)} className={field}>
                <option value="">Recommend one for me</option>
                {INTERACTION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rs-lms" className={label}>LMS profile</label>
              <select id="rs-lms" value={lmsProfile} onChange={(e) => setLmsProfile(e.target.value)} className={field}>
                {LMS_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <details className="rounded-lg border border-surface-200 dark:border-surface-700 p-3">
            <summary className="text-sm font-medium text-surface-700 dark:text-surface-300 cursor-pointer">
              Brand tokens (optional)
            </summary>
            <textarea rows={4} value={brandTokens} onChange={(e) => setBrandTokens(e.target.value)}
              maxLength={MAX_FIELD.brandTokens} aria-label="Brand tokens"
              placeholder={'--brand-primary: #1f4fd8;\n--brand-font-body: "Inter", sans-serif;'}
              className={cn(field, 'mt-2 font-mono text-xs resize-none')} />
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              Without tokens, the spec uses placeholder names and lists &quot;Needs brand tokens&quot; as an open question.
            </p>
          </details>

          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
            <input type="checkbox" checked={includeResearch} onChange={(e) => setIncludeResearch(e.target.checked)} />
            Include the learning science references (slower, longer prompt)
          </label>

          <button onClick={handleGenerate} disabled={!canSubmit}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50">
            {generating ? 'Writing the spec...' : 'Write the spec'}
          </button>
          {generating && (
            <p className="text-xs text-surface-500 dark:text-surface-400">This can take a minute or two. Specs are long.</p>
          )}
          {error && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="lg:col-span-3">
          {!spec && !generating && (
            <div className="h-full min-h-[18rem] flex items-center justify-center rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 p-8 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Your spec appears here</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                  You get a 16-section spec, a recommended interaction type with a reason, and a design principles audit.
                </p>
              </div>
            </div>
          )}

          {spec && (
            <div>
              {truncated && (
                <div role="alert" className="mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This spec hit the model&apos;s output limit and might be cut off. Check the last sections before you use it.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden" role="tablist">
                  {(['preview', 'markdown'] as const).map((v) => (
                    <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                      className={cn('px-3 py-1.5 text-xs font-medium',
                        view === v ? 'bg-brand-600 text-white' : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800')}>
                      {v === 'preview' ? 'Preview' : 'Markdown'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
                    Download
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 max-h-[70vh] overflow-y-auto">
                {view === 'preview' ? (
                  <MarkdownView>{spec}</MarkdownView>
                ) : (
                  <textarea readOnly value={spec} aria-label="Spec Markdown"
                    className="w-full h-[60vh] text-xs font-mono bg-transparent resize-none focus:outline-none" />
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-surface-500 dark:text-surface-400 mt-4">
            A spec is a draft. Check Rise and LMS details against current vendor documentation, and test any build in SCORM Cloud before it reaches your LMS.
          </p>
        </div>
      </div>
    </div>
  );
}
