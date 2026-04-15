import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getConfig } from "./env.js";
import { addDraft } from "./wechat.js";
import { buildArticle } from "./build-article.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const config = getConfig();
requireArg(args, "title");
requireArg(args, "file");
requireArg(args, "cover");

const { accessToken, article } = await buildArticle({ args, config, rootDir });
const result = await addDraft(accessToken, article);
console.log(JSON.stringify(result, null, 2));
