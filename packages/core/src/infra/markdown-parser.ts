import matter from "gray-matter";
import jsYaml from "js-yaml";

import type { Markdown } from "../types/markdown.js";

export class MarkdownParser {
  parse(text: string): Pick<Markdown, "content" | "metadata"> {
    const { content, data: metadata } = matter(text);
    return { content, metadata };
  }

  stringify(markdown: Markdown): string {
    return matter.stringify(markdown.content, markdown.metadata, {
      engines: {
        yaml: {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          parse: (input: string): object => jsYaml.load(input) as object,
          stringify: (data: object) => jsYaml.dump(data, { sortKeys: true }),
        },
      },
    });
  }
}
