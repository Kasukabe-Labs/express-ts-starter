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
  try {
    console.log("🚀 Kasukabe Express TypeScript CLI");
    console.log("Creating Express.js + TypeScript project...\n");

    const args = process.argv.slice(2);
    const isDot = args[0] === '.';

    let targetDir = process.cwd();
    let projectName = 'express-ts-project';

    if (!isDot) {
      const { projectName: inputName } = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Project name:",
          default: "express-ts-project",
          validate: (input) => {
            if (!input || input.trim() === '') {
              return "Project name cannot be empty";
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return "Project name can only contain letters, numbers, hyphens, and underscores";
            }
            return true;
          }
        }
      ]);
      
      projectName = inputName.trim();
      targetDir = path.join(process.cwd(), projectName);
      
      // Check if directory already exists
      if (fs.existsSync(targetDir)) {
        console.error(`❌ Directory "${projectName}" already exists!`);
        process.exit(1);
      }
      
      // Create directory
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Created directory: ${projectName}`);
      } catch (error) {
        console.error(`❌ Failed to create directory: ${error.message}`);
        process.exit(1);
      }
    }

    // Find template directory
    const possibleTemplatePaths = [
      path.join(__dirname, "../template"),
      path.resolve(__dirname, "../template"),
      path.join(path.dirname(__dirname), "template")
    ];
    
    let templateDir = null;
    for (const templatePath of possibleTemplatePaths) {
      if (fs.existsSync(templatePath)) {
        templateDir = templatePath;
        break;
      }
    }
    
    if (!templateDir) {
      console.error(`❌ Template directory not found!`);
      console.log("Searched in:");
      possibleTemplatePaths.forEach(p => console.log(`  - ${p}`));
      process.exit(1);
    }

    // Debug: Show what's in the template directory
    console.log(`📋 Template directory found: ${templateDir}`);
    try {
      const templateContents = fs.readdirSync(templateDir);
      console.log(`📋 Template contains: ${templateContents.join(', ')}`);
    } catch (error) {
      console.error(`❌ Cannot read template directory: ${error.message}`);
      process.exit(1);
    }

    console.log("📁 Copying template files...");

    // Copy template files
    await fs.copy(templateDir, targetDir, {
      filter: (src) => {
        const relativePath = path.relative(templateDir, src);
        
        // Always include the root template directory
        if (src === templateDir) return true;
        
        // Skip node_modules and .git directories
        if (relativePath.includes("node_modules") || relativePath.includes(".git")) {
          return false;
        }
        
        // Include everything else
        return true;
      },
      overwrite: true,
      errorOnExist: false
    });

    // Update package.json with project name
    const packageJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // Verify files were copied
    const copiedFiles = fs.readdirSync(targetDir);
    console.log(`✅ Copied ${copiedFiles.length} items`);

    if (!isDot) {
      process.chdir(targetDir);
    }

    // Install dependencies
    console.log("📦 Installing dependencies...");
    console.log("This may take a few minutes...\n");
    
    try {
      execSync("npm install", { 
        stdio: "inherit", 
        cwd: targetDir,
        env: { ...process.env, NODE_ENV: "development" }
      });
    } catch (error) {
      console.error("❌ Failed to install dependencies");
      console.log("You can install them manually by running:");
      console.log("npm install");
      process.exit(1);
    }

    console.log("\n🎉 Project created successfully!");
    console.log("\n📋 Next steps:");
    if (!isDot) {
      console.log(`   cd ${projectName}`);
    }
    console.log("   npm run build");
    console.log("   npm start");
    console.log("\n💡 For development with auto-reload:");
    console.log("   npm run dev\n");

  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    process.exit(1);
  }
}

main();