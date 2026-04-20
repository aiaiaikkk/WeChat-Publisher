import fs from "node:fs";
import path from "node:path";

export function loadEnv(rootDir) {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function getConfig() {
  const appid = process.env.WECHAT_APPID;
  const appsecret = process.env.WECHAT_APPSECRET;
  if (!appid || !appsecret) {
    throw new Error("Missing WECHAT_APPID or WECHAT_APPSECRET in .env");
  }
  return {
    appid,
    appsecret,
    author: process.env.WECHAT_AUTHOR || "",
    needOpenComment: Number(process.env.WECHAT_NEED_OPEN_COMMENT || 0),
    onlyFansCanComment: Number(process.env.WECHAT_ONLY_FANS_CAN_COMMENT || 0),
    superaiapi: getSuperaiapiConfig({ required: false }),
  };
}

export function getSuperaiapiConfig({ required = true } = {}) {
  const apiKey = process.env.SUPERAIAPI_API_KEY;
  const baseUrl = (process.env.SUPERAIAPI_BASE_URL || "https://superaiapi.top").replace(/\/+$/, "");
  if (required && !apiKey) {
    throw new Error("Missing SUPERAIAPI_API_KEY in .env");
  }
  return {
    apiKey: apiKey || "",
    baseUrl,
  };
}
