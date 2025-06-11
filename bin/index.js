#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const isDot = args[0] === '.';

  let targetDir = process.cwd();

  if (!isDot) {
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        validate: (input) => input ? true : "Project name cannot be empty"
      }
    ]);
    targetDir = path.join(process.cwd(), projectName);
    fs.mkdirSync(targetDir);
  }

  const templateDir = path.join(__dirname, "../template");

  await fs.copy(templateDir, targetDir, {
    filter: (src) => !src.includes("node_modules")
  });

  console.log("✅ Project created at:", targetDir);

  if (!isDot) process.chdir(targetDir);

  console.log("📦 Installing dependencies...");
  execSync("npm install", { stdio: "inherit" });

  console.log("🚀 Done! Run the following commands:");
  if (!isDot) {
    console.log(`cd ${path.basename(targetDir)}`);
  }
  console.log("npm run build && npm start");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
