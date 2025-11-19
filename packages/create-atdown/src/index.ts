#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prompts from "prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "..", "templates");

function createProject(projectDir: string, replacements: Record<string, string>) {
  fs.mkdirSync(projectDir, { recursive: true });

  const files = fs.readdirSync(templatesDir);
  for (const file of files) {
    const srcPath = path.join(templatesDir, file);
    // "gitignore" -> ".gitignore" (npm publish ignores .gitignore)
    const destName = file === "gitignore" ? ".gitignore" : file;
    const destPath = path.join(projectDir, destName);

    let content = fs.readFileSync(srcPath, "utf-8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replaceAll(`{{${placeholder}}}`, value);
    }
    fs.writeFileSync(destPath, content);
  }
}

const required = (value: unknown, message: string) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  throw new Error(message);
};

async function main() {
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
    });
    projectName = required(response.projectName, "Project name is required");
  }

  const response = await prompts([
    {
      type: "text",
      name: "handle",
      message: "ATProto handle (e.g. user.bsky.social):",
    },
    {
      type: "text",
      name: "entriesDir",
      message: "Entries directory:",
      initial: "./entries",
    },
  ]);
  const handle = required(response.handle, "Handle is required");
  const entriesDir = required(response.entriesDir, "Entries directory is required");

  const projectDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  createProject(projectDir, { projectName, handle, entriesDir });

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
