import type { MarkdownParser } from "../infra/markdown-parser.js";
import type { Markdown } from "../types/markdown.js";

export const isDifference = (
  a: Markdown,
  b: Markdown,
  infra: {
    markdownParser: MarkdownParser;
  },
) => {
  const aText = infra.markdownParser.stringify(a);
  const bText = infra.markdownParser.stringify(b);
  return aText !== bText;
};
