'use client';

import { useCallback, useEffect, useState } from 'react';

interface GuideInfo {
  id: string;
  name: string;
  custom: boolean;
  hasContentTypeRules: boolean;
}

/**
 * Lets the user choose which style guide the agents write to. Guides are
 * folders in style-guides/ (shipped) and style-guides/custom/ (personal).
 */
export default function StyleGuidePicker() {
  const [guides, setGuides] = useState<GuideInfo[]>([]);
  const [active, setActive] = useState('default');
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/style-guides');
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setGuides(data.guides);
      setActive(data.active);
      setStatus('ready');
    } catch {
      setStatus('error');
      setMessage('Could not load style guides.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const choose = async (id: string) => {
    const previous = active;
    setActive(id);
    setStatus('saving');
    setMessage('');
    try {
      const res = await fetch('/api/style-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('ready');
      setMessage('Saved. New generations use this guide.');
    } catch {
      setActive(previous);
      setStatus('error');
      setMessage('Could not save your choice.');
    }
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
      <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-1">Style guide</h2>
      <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
        The agents write to this guide. Add your own by placing a folder in <code>style-guides/custom</code>.
      </p>

      <label htmlFor="style-guide-select" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
        Active guide
      </label>
      <select
        id="style-guide-select"
        value={active}
        disabled={status === 'loading' || status === 'saving'}
        onChange={(e) => choose(e.target.value)}
        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100"
      >
        {status === 'loading' && <option value="">Loading guides...</option>}
        {guides.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
            {g.custom ? ' (custom)' : ''}
          </option>
        ))}
      </select>

      <p role="status" aria-live="polite" className="text-xs mt-2 min-h-[1rem] text-surface-600 dark:text-surface-400">
        {status === 'saving' ? 'Saving...' : message}
      </p>
    </div>
  );
}
