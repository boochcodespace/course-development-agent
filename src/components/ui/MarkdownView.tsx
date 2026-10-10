'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { splitFrontMatter } from '@/lib/markdown';

interface MarkdownViewProps {
  children: string;
  /** Show leading YAML front matter as a collapsed "Details" block instead of running it into the text. */
  showFrontMatter?: boolean;
}

/**
 * Renders Markdown the way the stage artifacts and specs are written: GitHub
 * style tables and task lists, and readable typography in light and dark mode.
 */
export default function MarkdownView({ children, showFrontMatter = true }: MarkdownViewProps) {
  const { frontMatter, body } = splitFrontMatter(children);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-table:text-xs prose-th:text-left">
      {showFrontMatter && frontMatter && (
        <details className="not-prose mb-4 rounded-lg border border-surface-200 dark:border-surface-700 p-3">
          <summary className="text-xs font-medium text-surface-600 dark:text-surface-300 cursor-pointer">
            Spec details
          </summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-surface-700 dark:text-surface-300">{frontMatter}</pre>
        </details>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
