import type { Config } from "../config.js";
import type { ConverterLoader } from "../infra/converter-loader.js";
import type { HandleResolver } from "../infra/handle-resolver.js";
import type { MarkdownParser } from "../infra/markdown-parser.js";
import type { MarkdownRepository } from "../infra/markdown-repository.js";
import type { RecordRepository } from "../infra/record-repository.js";
import { isDifference } from "../service/diff.js";
import type { EntryRecord } from "../types/record.js";

export const doPush = async (
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

  // 3. Fetch and diff markdowns for each converter
  const pushableRecords: EntryRecord[] = [];
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
    const pushables = localEntries.filter((localEntry) => {
      const remoteEntry = remoteEntries.find(
        (m) => m.collection === localEntry.collection && m.rkey === localEntry.rkey,
      );
      return (
        !remoteEntry ||
        isDifference(localEntry.markdown, remoteEntry.markdown, {
          markdownParser: infra.markdownParser,
        })
      );
    });
    const pushableRecordsForConverter = await Promise.all(
      pushables.map(async (entry) => {
        const json = await converter.markdownToRecord(entry.markdown);
        return { collection: entry.collection, rkey: entry.rkey, json };
      }),
    );
    pushableRecords.push(...pushableRecordsForConverter);
  }

  // 4. Save pushable records to PDS
  for (const record of pushableRecords) {
    await infra.recordRepository.save(record);
  }
};
