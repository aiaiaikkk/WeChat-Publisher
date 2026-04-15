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
const articleType = String(args["article-type"] || "news").trim().toLowerCase();
requireArg(args, "title");
requireArg(args, "file");
if (articleType === "news") {
  requireArg(args, "cover");
} else if (articleType === "newspic") {
  if (!args.image && !args.cover) {
    throw new Error("Missing --image (or --cover) for article_type=newspic");
  }
} else {
  throw new Error(`Unsupported --article-type: ${articleType}. Expected news or newspic.`);
}

const { accessToken, article } = await buildArticle({ args, config, rootDir });
const result = await addDraft(accessToken, article);
console.log(JSON.stringify(result, null, 2));
