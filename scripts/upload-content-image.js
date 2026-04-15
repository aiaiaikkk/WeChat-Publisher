import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getConfig } from "./env.js";
import { getStableAccessToken, uploadContentImage } from "./wechat.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const image = requireArg(args, "image");
const token = await getStableAccessToken(getConfig(), rootDir);
const url = await uploadContentImage(token, image);
console.log(url);

