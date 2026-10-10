'use client';

import React from 'react';
import type { ChatMessage as ChatMessageType, PipelineActionPayload, StageId } from '@/lib/types';
import { PIPELINE_STAGES } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

interface PipelineActionMessageProps {
  message: ChatMessageType;
  action: PipelineActionPayload;
}

const STAGE_TO_VIEW: Record<StageId, 'analysis' | 'outline' | 'design-doc' | 'quality-assurance' | 'content-draft' | 'development'> = {
  'needs-analysis': 'analysis',
  'outline': 'outline',
  'design-docs': 'design-doc',
  'qa': 'quality-assurance',
  'content-draft': 'content-draft',
  'dev-support': 'development',
};

export default function PipelineActionMessage({ message, action }: PipelineActionMessageProps) {
  const setActiveView = useAppStore((s) => s.setActiveView);

  const stageLabel =
    PIPELINE_STAGES.find((s) => s.id === action.stageId)?.label || action.stageId;
  const isGenerate = action.type === 'generate';
  const actionVerb = isGenerate ? 'Generated' : 'Revised';

  const handleOpen = () => {
    const view = STAGE_TO_VIEW[action.stageId];
    if (view) setActiveView(view);
  };

  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-5">
        <svg
          className="w-4 h-4 text-brand-700 dark:text-brand-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <div className="flex flex-col max-w-[80%] items-start">
        <div className="rounded-2xl rounded-bl-md border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={
                'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ' +
                (isGenerate
                  ? 'bg-brand-600 text-white'
                  : 'bg-amber-600 text-white')
              }
            >
              {actionVerb}
            </span>
            <span className="text-xs font-semibold text-surface-900 dark:text-surface-100">
              {stageLabel}
            </span>
          </div>

          {message.content.trim() && (
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap mb-2">
              {message.content.trim()}
            </p>
          )}

          {action.changeDescription && (
            <p className="text-xs text-surface-600 dark:text-surface-400 italic mb-2">
              {action.changeDescription}
            </p>
          )}

          {action.contextSummary && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
              {action.contextSummary}
            </p>
          )}

          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 hover:text-brand-900 dark:hover:text-brand-100 hover:underline"
          >
            Open {stageLabel}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </button>
        </div>

        <span className="text-xs text-surface-500 mt-1 px-1">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
