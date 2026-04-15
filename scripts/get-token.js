import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, getConfig } from "./env.js";
import { getStableAccessToken } from "./wechat.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const token = await getStableAccessToken(getConfig(), rootDir);
console.log(`access_token ok: ${token.slice(0, 8)}...`);

