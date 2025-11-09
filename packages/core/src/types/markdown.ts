export type Markdown = {
  content: string;
  metadata: Record<string, unknown>;
};

export type MarkdownEntry = {
  collection: string;
  rkey: string;
  markdown: Markdown;
};
