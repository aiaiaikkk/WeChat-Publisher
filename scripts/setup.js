import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envExamplePath = path.join(rootDir, ".env.example");
const envPath = path.join(rootDir, ".env");
const args = new Set(process.argv.slice(2));
const force = args.has("--force");

function ensureNodeVersion() {
  const major = Number(process.versions.node.split(".")[0] || 0);
  if (major < 20) {
    throw new Error(
      `Node.js >= 20 is required, current version is ${process.version}.`,
    );
  }
}

function main() {
  ensureNodeVersion();

  if (!fs.existsSync(envExamplePath)) {
    throw new Error("Missing .env.example");
  }

  if (fs.existsSync(envPath) && !force) {
    console.log(".env already exists, keeping current file.");
  } else {
    fs.copyFileSync(envExamplePath, envPath);
    console.log(fs.existsSync(envPath) && force ? ".env recreated from .env.example." : ".env created from .env.example.");
  }

  console.log("");
  console.log("Next steps:");
  console.log("1. Open .env and fill WECHAT_APPID / WECHAT_APPSECRET.");
  console.log("2. Optionally adjust WECHAT_AUTHOR and comment settings.");
  console.log("3. Run: npm run doctor");
  console.log("4. If doctor passes, create a draft with: npm run draft -- --title \"...\" --file examples/article.md --cover examples/cover.svg.png");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
