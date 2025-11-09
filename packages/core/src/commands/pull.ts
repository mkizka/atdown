import type { Config } from "../config.js";
import type { ConverterLoader } from "../infra/converter-loader.js";
import type { HandleResolver } from "../infra/handle-resolver.js";
import type { MarkdownParser } from "../infra/markdown-parser.js";
import type { MarkdownRepository } from "../infra/markdown-repository.js";
import type { RecordRepository } from "../infra/record-repository.js";
import { isDifference } from "../service/diff.js";
import type { MarkdownEntry } from "../types/markdown.js";

export const doPull = async (
  config: Config,
  password: string,
  infra: {
    converterLoader: ConverterLoader;
    handleResolver: HandleResolver;
    recordRepository: RecordRepository;
    markdownRepository: MarkdownRepository;
    markdownParser: MarkdownParser;
  },
): Promise<void> => {
  // 1. Login to user's PDS
  const pds = await infra.handleResolver.resolve(config.handle);
  await infra.recordRepository.login(pds, config.handle, password);

  // 2. Load all converters
  const converters = await Promise.all(
    config.converters.map((path) => infra.converterLoader.load(path)),
  );

  // 3. Fetch and diff records for each converter
  const pullableEntries: MarkdownEntry[] = [];
  for (const converter of converters) {
    const [localEntries, remoteRecords] = await Promise.all([
      infra.markdownRepository.list(converter.collection),
      infra.recordRepository.list(converter.collection),
    ]);
    const remoteEntries = await Promise.all(
      remoteRecords.map(async (record) => {
        const markdown = await converter.recordToMarkdown(record.json);
        return { collection: record.collection, rkey: record.rkey, markdown };
      }),
    );
    const pullables = remoteEntries.filter((remoteEntry) => {
      const localEntry = localEntries.find(
        (m) => m.collection === remoteEntry.collection && m.rkey === remoteEntry.rkey,
      );
      return (
        !localEntry ||
        isDifference(localEntry.markdown, remoteEntry.markdown, {
          markdownParser: infra.markdownParser,
        })
      );
    });
    pullableEntries.push(...pullables);
  }

  // 4. Save pullable markdowns to local repository
  for (const entry of pullableEntries) {
    await infra.markdownRepository.save(entry);
  }
};
