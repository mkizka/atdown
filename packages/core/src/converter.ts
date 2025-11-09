import type { Markdown } from "./types/markdown.js";
import type { RecordJson } from "./types/record.js";

export interface AtdownConverter {
  collection: string;
  markdownToRecord: (markdown: Markdown) => Promise<RecordJson> | RecordJson;
  recordToMarkdown: (record: RecordJson) => Promise<Markdown> | Markdown;
}

export const createConverter = (converter: AtdownConverter): AtdownConverter => {
  return converter;
};
