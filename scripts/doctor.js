import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { getStableAccessToken } from "./wechat.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

function ok(message) {
  console.log(`OK   ${message}`);
}

function warn(message) {
  console.log(`WARN ${message}`);
}

function fail(message) {
  console.log(`FAIL ${message}`);
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const out = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function isPlaceholder(value) {
  if (!value) {
    return true;
  }
  return [
    "your_appid_here",
    "your_appsecret_here",
    "your_superaiapi_api_key_here",
  ].includes(String(value).trim());
}

async function main() {
  let hasFailure = false;
  const major = Number(process.versions.node.split(".")[0] || 0);
  if (major >= 20) {
    ok(`Node.js version ${process.version}`);
  } else {
    fail(`Node.js >= 20 is required, current version is ${process.version}`);
    hasFailure = true;
  }

  if (fs.existsSync(envExamplePath)) {
    ok(".env.example exists");
  } else {
    fail(".env.example is missing");
    hasFailure = true;
  }

  if (fs.existsSync(envPath)) {
    ok(".env exists");
  } else {
    fail(".env is missing, run: npm run setup");
    hasFailure = true;
  }

  loadEnv(rootDir);
  const env = readEnvFile(envPath);

  for (const key of ["WECHAT_APPID", "WECHAT_APPSECRET"]) {
    if (!env[key]) {
      fail(`${key} is missing in .env`);
      hasFailure = true;
    } else if (isPlaceholder(env[key])) {
      fail(`${key} is still using placeholder value`);
      hasFailure = true;
    } else {
      ok(`${key} is configured`);
    }
  }

  for (const key of [
    "WECHAT_AUTHOR",
    "WECHAT_NEED_OPEN_COMMENT",
    "WECHAT_ONLY_FANS_CAN_COMMENT",
    "SUPERAIAPI_BASE_URL",
  ]) {
    if (env[key]) {
      ok(`${key} is configured`);
    } else {
      warn(`${key} is empty, default behavior may be used`);
    }
  }

  if (!env.SUPERAIAPI_API_KEY) {
    warn("SUPERAIAPI_API_KEY is missing; image/video generation will be unavailable");
  } else if (isPlaceholder(env.SUPERAIAPI_API_KEY)) {
    warn("SUPERAIAPI_API_KEY is still using placeholder value; image/video generation will be unavailable");
  } else {
    ok("SUPERAIAPI_API_KEY is configured");
  }

  if (!hasFailure) {
    try {
      const accessToken = await getStableAccessToken(
        {
          appid: env.WECHAT_APPID,
          appsecret: env.WECHAT_APPSECRET,
        },
        rootDir,
      );
      if (accessToken) {
        ok("WeChat stable access_token request succeeded");
      } else {
        fail("WeChat stable access_token request returned empty token");
        hasFailure = true;
      }
    } catch (error) {
      hasFailure = true;
      const message = error instanceof Error ? error.message : String(error);
      fail(`WeChat token check failed: ${message}`);
      if (message.includes("40164")) {
        warn("Current machine IP is probably not in the WeChat backend whitelist.");
      }
    }
  } else {
    warn("Skipped token check because required configuration is incomplete.");
  }

  console.log("");
  if (hasFailure) {
    console.log("Doctor finished with issues.");
    process.exit(1);
  }

  console.log("Doctor finished successfully.");
  console.log(
    'Next: npm run draft -- --title "标题" --file examples/article.md --cover examples/cover.svg.png',
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
