'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { analyzeAlignment, extractAlignmentData } from '@/lib/alignment';

interface AlignmentMapProps {
  /** The outline's Markdown, including its alignment-json block. */
  markdown: string;
}

/**
 * Shows which modules teach and which assessments measure each course
 * objective, and calls out gaps. It reads the alignment data the outline agent
 * writes, so the map is only as accurate as that data. Check it against the
 * outline text.
 */
export default function AlignmentMap({ markdown }: AlignmentMapProps) {
  const result = useMemo(() => extractAlignmentData(markdown), [markdown]);
  const analysis = useMemo(() => (result.ok ? analyzeAlignment(result.data) : null), [result]);

  if (!result.ok || !analysis) {
    const message = result.ok ? '' : result.message;
    const missing = !result.ok && result.reason === 'missing';
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6">
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
            {missing ? 'No alignment map yet' : 'The alignment data needs a fix'}
          </h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">{message}</p>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
            {missing
              ? 'Outlines generated with the current version include it. Regenerate the outline, or ask in Chat to add an alignment data block to this one.'
              : 'Switch to the document view and fix the block near the end of the outline, or regenerate the outline.'}
          </p>
        </div>
      </div>
    );
  }

  const { data } = result;
  const { gaps, stats } = analysis;
  const gapsFor = (id: string) => gaps.filter((g) => g.subjectId === id);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">Alignment map</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
          Each row is a course objective. A filled dot means the module teaches it. The last column lists the assessments that measure it.
        </p>
      </div>

      {/* Summary */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Objectives taught', `${stats.objectivesTaught} of ${stats.objectives}`],
          ['Objectives assessed', `${stats.objectivesAssessed} of ${stats.objectives}`],
          ['Modules', String(stats.modules)],
          ['Gaps found', String(gaps.length)],
        ].map(([term, value]) => (
          <div key={term} className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-2">
            <dt className="text-xs text-surface-500 dark:text-surface-400">{term}</dt>
            <dd className="text-lg font-semibold text-surface-900 dark:text-surface-100">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Gaps */}
      {gaps.length > 0 ? (
        <div role="region" aria-label="Alignment gaps" className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Gaps to resolve ({gaps.length})</h4>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            {gaps.map((g, i) => (
              <li key={`${g.subjectId}-${g.kind}-${i}`} className="text-sm text-amber-900 dark:text-amber-200">
                {g.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-900 dark:text-green-200">
            Every objective is taught and assessed, and every module and assessment ties back to an objective.
          </p>
        </div>
      )}

      {/* Matrix */}
      <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Course objectives against the modules that teach them and the assessments that measure them</caption>
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-900">
              <th scope="col" className="text-left px-3 py-2 font-medium text-surface-700 dark:text-surface-300 min-w-[16rem]">Objective</th>
              {data.modules.map((m) => (
                <th key={m.id} scope="col" className="px-2 py-2 font-medium text-surface-700 dark:text-surface-300 align-bottom min-w-[5.5rem]">
                  <span className="block text-xs text-surface-500 dark:text-surface-400">{m.id}</span>
                  <span className="block text-xs leading-tight">{m.title}</span>
                </th>
              ))}
              <th scope="col" className="text-left px-3 py-2 font-medium text-surface-700 dark:text-surface-300 min-w-[12rem]">Assessed by</th>
            </tr>
          </thead>
          <tbody>
            {data.objectives.map((o) => {
              const assessments = data.assessments.filter((a) => a.objectiveIds.includes(o.id));
              const oGaps = gapsFor(o.id);
              return (
                <tr key={o.id} className="border-t border-surface-200 dark:border-surface-700 align-top">
                  <th scope="row" className="text-left px-3 py-2 font-normal">
                    <span className="font-medium text-surface-900 dark:text-surface-100">{o.id}</span>
                    {(o.bloom || o.dok) && (
                      <span className="ml-2 text-xs text-surface-500 dark:text-surface-400">
                        {[o.bloom, o.dok ? `DOK ${o.dok}` : ''].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span className="block text-surface-700 dark:text-surface-300">{o.text}</span>
                    {oGaps.length > 0 && (
                      <span className="block text-xs font-medium text-amber-800 dark:text-amber-300 mt-1">Needs attention</span>
                    )}
                  </th>
                  {data.modules.map((m) => {
                    const teaches = m.objectiveIds.includes(o.id);
                    return (
                      <td key={m.id} className="text-center px-2 py-2">
                        <span
                          role="img"
                          aria-label={teaches ? `${m.title} teaches ${o.id}` : `${m.title} does not teach ${o.id}`}
                          className={cn('inline-block w-3 h-3 rounded-full border-2',
                            teaches ? 'bg-brand-600 border-brand-600' : 'border-surface-300 dark:border-surface-600')}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2">
                    {assessments.length > 0 ? (
                      <ul className="space-y-0.5">
                        {assessments.map((a) => (
                          <li key={a.id} className="text-xs text-surface-700 dark:text-surface-300">
                            {a.type}
                            <span className="text-surface-400"> ({a.id}{a.moduleId ? `, ${a.moduleId}` : ''})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-300">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-surface-500 dark:text-surface-400">
        This map is built from the alignment data block at the end of the outline. The agent writes that block, so check it against the outline text before you rely on it.
      </p>
    </div>
  );
}
