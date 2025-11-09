import fs from "node:fs/promises";
import path from "node:path";

import type { Config } from "../config.js";
import type { MarkdownEntry } from "../types/markdown.js";
import type { MarkdownParser } from "./markdown-parser.js";

const isNotFoundError = (error: unknown): boolean => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
};

export class MarkdownRepository {
  #config;
  #parser;

  constructor(config: Config, parser: MarkdownParser) {
    this.#config = config;
    this.#parser = parser;
  }

  async list(collection: string): Promise<MarkdownEntry[]> {
    const collectionDir = path.join(this.#config.entriesDir, collection);

    try {
      const files = await fs.readdir(collectionDir, { recursive: true });
      const markdownFiles = files.filter((file) => file.endsWith(".md"));
      const entries: MarkdownEntry[] = [];
      for (const markdownFile of markdownFiles) {
        const markdownText = await fs.readFile(path.join(collectionDir, markdownFile), "utf-8");
        const rkey = path.basename(markdownFile, ".md");
        const markdown = this.#parser.parse(markdownText);
        entries.push({ collection, rkey, markdown });
      }
      return entries;
    } catch (error) {
      if (isNotFoundError(error)) {
        return [];
      }
      throw error;
    }
  }

  #getPath(entry: MarkdownEntry): string {
    return path.join(this.#config.entriesDir, entry.collection, `${entry.rkey}.md`);
  }

  async save(entry: MarkdownEntry): Promise<void> {
    const filePath = this.#getPath(entry);
    const markdownText = this.#parser.stringify(entry.markdown);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, markdownText, "utf-8");
  }

  async delete(entry: MarkdownEntry): Promise<void> {
    const filePath = this.#getPath(entry);
    await fs.unlink(filePath);
  }
}
