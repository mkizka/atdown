#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkbox, input } from "@inquirer/prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "..", "templates");

function createProject(projectDir: string, replacements: Record<string, string>) {
  fs.mkdirSync(projectDir, { recursive: true });

  const files = fs.readdirSync(templatesDir);
  for (const file of files) {
    const srcPath = path.join(templatesDir, file);
    const destName = file.replace(/\.tmpl$/, "");
    const destPath = path.join(projectDir, destName);

    let content = fs.readFileSync(srcPath, "utf-8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replaceAll(`{{${placeholder}}}`, value);
    }
    fs.writeFileSync(destPath, content);
  }
}

async function main() {
  const projectName =
    process.argv[2] ??
    (await input({
      message: "Project name:",
      required: true,
    }));

  const handle = await input({
    message: "ATProto handle (e.g. user.bsky.social):",
    required: true,
  });

  const entriesDir = await input({
    message: "Entries directory:",
    default: "./entries",
    required: true,
  });

  const converters = await checkbox({
    message: "Select converters:",
    choices: [{ name: "@mkizka/atdown-whtwnd", value: "@mkizka/atdown-whtwnd", checked: true }],
    required: true,
  });

  const projectDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  createProject(projectDir, {
    projectName,
    handle,
    entriesDir,
    converters: JSON.stringify(converters),
    converterDeps: converters.map((c) => `"${c}": "latest"`).join(",\n    "),
  });

  console.log(`
Created ${projectName} successfully!

Next steps:
  cd ${projectName}
  npm install
  cp .env.example .env
  # Edit .env and set ATDOWN_PASSWORD
  npm run pull
`);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
});
