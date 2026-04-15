import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getConfig } from "./env.js";
import { getStableAccessToken, uploadPermanentImage } from "./wechat.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const image = requireArg(args, "image");
const token = await getStableAccessToken(getConfig(), rootDir);
const mediaId = await uploadPermanentImage(token, image);
console.log(mediaId);

