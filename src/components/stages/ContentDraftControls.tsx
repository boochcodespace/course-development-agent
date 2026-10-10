'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CONTENT_FORMAT_LABELS,
  type ContentFormat,
  type DraftEntry,
  type OutlineModule,
} from '@/lib/content-draft';

interface ContentDraftControlsProps {
  modules: OutlineModule[];
  drafts: DraftEntry[];
  generating: boolean;
  disabled?: boolean;
  onDraft: (module: string, format: ContentFormat, guidance?: string) => void;
}

/** Pick a module and a format, then draft one module at a time. */
export default function ContentDraftControls({
  modules,
  drafts,
  generating,
  disabled,
  onDraft,
}: ContentDraftControlsProps) {
  const [moduleChoice, setModuleChoice] = useState(modules[0]?.label ?? '');
  const [customModule, setCustomModule] = useState('');
  const [format, setFormat] = useState<ContentFormat>('rise');
  const [guidance, setGuidance] = useState('');

  const selected = modules.length > 0 ? moduleChoice : customModule.trim();
  const alreadyDrafted = drafts.some((d) => d.module === selected && d.format === format);

  return (
    <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Draft one module at a time</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
          Short, focused runs give better writing than a whole course at once. Each draft is a starting point for you to review.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="cd-module" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
            Module
          </label>
          {modules.length > 0 ? (
            <select
              id="cd-module"
              value={moduleChoice}
              onChange={(e) => setModuleChoice(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-900"
            >
              {modules.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="cd-module"
              value={customModule}
              onChange={(e) => setCustomModule(e.target.value)}
              placeholder="For example: Module 1: Your first 90 days"
              className="w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-900"
            />
          )}
          {modules.length === 0 && (
            <p className="text-xs text-surface-400 mt-1">No modules were found in the committed outline, so type the module name.</p>
          )}
        </div>

        <fieldset>
          <legend className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Format</legend>
          <div className="flex gap-2">
            {(Object.keys(CONTENT_FORMAT_LABELS) as ContentFormat[]).map((f) => (
              <label
                key={f}
                className={cn(
                  'flex-1 cursor-pointer px-3 py-2 text-xs rounded-lg border text-center',
                  format === f
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                    : 'border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300'
                )}
              >
                <input
                  type="radio"
                  name="cd-format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="sr-only"
                />
                {CONTENT_FORMAT_LABELS[f]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="cd-guidance" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
          Guidance (optional)
        </label>
        <textarea
          id="cd-guidance"
          rows={2}
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="For example: open with the escalation story from the SME notes."
          className="w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg resize-none bg-white dark:bg-surface-900"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {drafts.length === 0
            ? 'No modules drafted yet.'
            : `Drafted: ${drafts.map((d) => `${d.module} (${d.format === 'rise' ? 'Rise' : 'ILT'})`).join(', ')}`}
        </p>
        <button
          onClick={() => onDraft(selected, format, guidance.trim() || undefined)}
          disabled={generating || disabled || !selected}
          className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {alreadyDrafted ? 'Redraft this module' : 'Draft this module'}
        </button>
      </div>
      {alreadyDrafted && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          This replaces the existing draft for this module and format. Your edits to it will be lost.
        </p>
      )}
    </div>
  );
}
