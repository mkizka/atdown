#!/usr/bin/env node

import "dotenv/config";

import { readFileSync } from "node:fs";

import * as core from "@mkizka/atdown-core";
import { Command } from "commander";
import * as v from "valibot";

import { loadConfig } from "./config-loader.js";
import { getPassword } from "./get-password.js";

const packageJson = v.parse(
  v.object({ version: v.string() }),
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")),
);

const program = new Command();

program
  .name("atdown")
  .description("CLI to sync and update ATProto records with local Markdown files")
  .version(packageJson.version);

program
  .command("push")
  .description("Upload local Markdown files to PDS")
  .action(async () => {
    try {
      const config = await loadConfig(process.cwd());
      const password = await getPassword();
      await core.pushCommand(config, password);
      console.log("✓ Push completed successfully");
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("pull")
  .description("Download PDS records and save as local Markdown files")
  .action(async () => {
    try {
      const config = await loadConfig(process.cwd());
      const password = await getPassword();
      await core.pullCommand(config, password);
      console.log("✓ Pull completed successfully");
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("new")
  .description("Create a new Markdown file")
  .action(async () => {
    try {
      const config = await loadConfig(process.cwd());
      const filePath = await core.newCommand(config);
      console.log(`✓ Created: ${filePath}`);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
