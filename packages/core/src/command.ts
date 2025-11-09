import { doPull } from "./commands/pull.js";
import { doPush } from "./commands/push.js";
import type { Config } from "./config.js";
import { ConverterLoader } from "./infra/converter-loader.js";
import { HandleResolver } from "./infra/handle-resolver.js";
import { MarkdownParser } from "./infra/markdown-parser.js";
import { MarkdownRepository } from "./infra/markdown-repository.js";
import { RecordRepository } from "./infra/record-repository.js";

const createInfra = (config: Config) => {
  const markdownParser = new MarkdownParser();
  return {
    converterLoader: new ConverterLoader(),
    handleResolver: new HandleResolver(),
    recordRepository: new RecordRepository(),
    markdownRepository: new MarkdownRepository(config, markdownParser),
    markdownParser: markdownParser,
  };
};

export const pull = (config: Config, password: string) => {
  const infra = createInfra(config);
  return doPull(config, password, infra);
};

export const push = (config: Config, password: string) => {
  const infra = createInfra(config);
  return doPush(config, password, infra);
};
