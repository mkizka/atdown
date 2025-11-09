import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Config } from "@mkizka/atdown-core";
import * as v from "valibot";

const ConfigFileSchema = v.object({
  handle: v.optional(v.string("handle is required")),
  entriesDir: v.optional(v.string()),
  converters: v.optional(v.pipe(v.array(v.string()))),
});

type ConfigFile = v.InferOutput<typeof ConfigFileSchema>;

const EnvSchema = v.object({
  ATDOWN_HANDLE: v.optional(v.pipe(v.string())),
  ATDOWN_ENTRIES_DIR: v.optional(v.string()),
  ATDOWN_CONVERTERS: v.optional(
    v.pipe(
      v.string(),
      v.transform((s) => s.split(",").map((x) => x.trim())),
    ),
  ),
});

const ConfigSchema = v.object({
  handle: v.string("handle is required"),
  entriesDir: v.optional(v.string(), "./entries"),
  converters: v.pipe(v.array(v.string()), v.length(1, "at least one converter is required")),
});

const isNotFoundError = (error: unknown): boolean => {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
};

async function loadConfigFile(configPath: string): Promise<ConfigFile> {
  try {
    const content = await readFile(configPath, "utf-8");
    return v.parse(ConfigFileSchema, JSON.parse(content));
  } catch (error) {
    if (isNotFoundError(error)) {
      return {};
    }
    throw error;
  }
}

export async function loadConfig(cwd: string): Promise<Config> {
  const configFilePath = path.join(cwd, "atdown.json");
  const fileConfig = await loadConfigFile(configFilePath);

  const env = v.parse(EnvSchema, process.env);

  const finalConfig = {
    handle: fileConfig.handle ?? env.ATDOWN_HANDLE,
    entriesDir: fileConfig.entriesDir ?? env.ATDOWN_ENTRIES_DIR,
    converters: fileConfig.converters ?? env.ATDOWN_CONVERTERS,
  };
  return v.parse(ConfigSchema, finalConfig);
}
