import { TID } from "@atproto/common-web";

import type { Config } from "../config.js";
import type { ConverterLoader } from "../infra/converter-loader.js";
import type { MarkdownRepository } from "../infra/markdown-repository.js";

export const doNew = async (
  config: Config,
  infra: {
    converterLoader: ConverterLoader;
    markdownRepository: MarkdownRepository;
  },
): Promise<string> => {
  const firstConverter = config.converters[0];
  if (!firstConverter) {
    throw new Error("No converters configured");
  }

  const converter = await infra.converterLoader.load(firstConverter);

  const newEntry = {
    collection: converter.collection,
    rkey: TID.next().toString(),
    markdown: {
      content: "",
      metadata: {
        createdAt: new Date().toISOString(),
      },
    },
  };

  if (await infra.markdownRepository.exists(newEntry)) {
    throw new Error(`File already exists`);
  }

  return await infra.markdownRepository.save(newEntry);
};
