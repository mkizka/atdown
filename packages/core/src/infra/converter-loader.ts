import * as v from "valibot";

import type { AtdownConverter } from "../converter.js";

const EntryConverterSchema = v.object({
  collection: v.string(),
  markdownToRecord: v.function(),
  recordToMarkdown: v.function(),
});

const ModuleSchema = v.object({
  default: EntryConverterSchema,
});

export class ConverterLoader {
  async load(name: string): Promise<AtdownConverter> {
    const module: unknown = await import(name);
    const result = v.safeParse(ModuleSchema, module);

    if (!result.success) {
      const flatErrors = v.flatten(result.issues);
      const errorMessage = flatErrors.nested?.["default"]?.[0] ?? "Invalid module structure";
      throw new Error(`Module ${name} does not export a valid converter: ${errorMessage}`);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return result.output.default as AtdownConverter;
  }
}
