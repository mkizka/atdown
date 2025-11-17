#!/usr/bin/env node

import * as core from "@mkizka/atdown-core";
import { Command } from "commander";

import { loadConfig } from "./config-loader.js";
import { getPassword } from "./get-password.js";

const program = new Command();

program
  .name("atdown")
  .description("Markdownで表現可能なATProtoレコードをPDSとローカルで同期・更新するCLI")
  .version("0.0.0");

program
  .command("push")
  .description("ローカルのMarkdownファイルをPDSにアップロード")
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
  .description("PDSのレコードをローカルにMarkdownファイルとして保存")
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
  .description("新しいMarkdownファイルを作成")
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
