/**
 * Split leading YAML front matter (a block between two lines of three
 * hyphens at the very start of the text) from the rest of a Markdown document.
 */
export function splitFrontMatter(markdown: string): { frontMatter: string | null; body: string } {
  const match = markdown.match(/^\s*---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) return { frontMatter: null, body: markdown };
  return { frontMatter: match[1].trim(), body: markdown.slice(match[0].length) };
}
