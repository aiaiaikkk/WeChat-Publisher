import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getConfig } from "./env.js";
import { getStableAccessToken, getDraft } from "./wechat.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const mediaId = requireArg(args, "media-id");
const token = await getStableAccessToken(getConfig(), rootDir);
const result = await getDraft(token, mediaId);

console.log(JSON.stringify(result, null, 2));

