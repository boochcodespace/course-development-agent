'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatRevisionDiffProps {
  priorMarkdown: string;
  currentMarkdown: string;
  changeDescription: string;
  onDismiss: () => void;
}

type DiffOp = 'equal' | 'add' | 'remove';

interface DiffLine {
  op: DiffOp;
  text: string;
}

/**
 * Simple LCS-based line diff. Sufficient for Markdown revisions up to a few
 * hundred lines.
 */
function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const n = aLines.length;
  const m = bLines.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const ops: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      ops.push({ op: 'equal', text: aLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ op: 'remove', text: aLines[i] });
      i++;
    } else {
      ops.push({ op: 'add', text: bLines[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ op: 'remove', text: aLines[i++] });
  }
  while (j < m) {
    ops.push({ op: 'add', text: bLines[j++] });
  }
  return ops;
}

/**
 * Compact diff: only show changed lines plus a small amount of equal context.
 */
function compactDiff(ops: DiffLine[], contextLines = 2): DiffLine[] {
  const keep = new Array(ops.length).fill(false);
  for (let k = 0; k < ops.length; k++) {
    if (ops[k].op !== 'equal') {
      const start = Math.max(0, k - contextLines);
      const end = Math.min(ops.length - 1, k + contextLines);
      for (let m = start; m <= end; m++) keep[m] = true;
    }
  }

  const result: DiffLine[] = [];
  let sawSkip = false;
  for (let k = 0; k < ops.length; k++) {
    if (keep[k]) {
      result.push(ops[k]);
      sawSkip = false;
    } else if (!sawSkip) {
      result.push({ op: 'equal', text: '\u2026' });
      sawSkip = true;
    }
  }
  return result;
}

export default function ChatRevisionDiff({
  priorMarkdown,
  currentMarkdown,
  changeDescription,
  onDismiss,
}: ChatRevisionDiffProps) {
  const [collapsed, setCollapsed] = useState(false);

  const diff = useMemo(() => {
    const full = diffLines(priorMarkdown, currentMarkdown);
    return compactDiff(full, 2);
  }, [priorMarkdown, currentMarkdown]);

  const addCount = diff.filter((d) => d.op === 'add').length;
  const removeCount = diff.filter((d) => d.op === 'remove').length;

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-700 dark:text-amber-300 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.38c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Changes from chat revision
            </h4>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            {changeDescription}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
            +{addCount} line{addCount === 1 ? '' : 's'} &middot; -{removeCount} line
            {removeCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
            aria-label={collapsed ? 'Expand diff' : 'Collapse diff'}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
          <button
            onClick={onDismiss}
            className="px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>

      {!collapsed && diff.length > 0 && (
        <div className="border-t border-amber-200 dark:border-amber-800 bg-white dark:bg-surface-900 max-h-64 overflow-y-auto">
          <pre className="text-[11px] font-mono leading-snug">
            {diff.map((d, idx) => (
              <div
                key={idx}
                className={cn(
                  'px-3 py-0.5 whitespace-pre-wrap break-words',
                  d.op === 'add' &&
                    'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
                  d.op === 'remove' &&
                    'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 line-through',
                  d.op === 'equal' && 'text-surface-500 dark:text-surface-400'
                )}
              >
                {d.op === 'add' ? '+ ' : d.op === 'remove' ? '- ' : '  '}
                {d.text || '\u00a0'}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
