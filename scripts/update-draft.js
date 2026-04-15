import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getConfig } from "./env.js";
import { updateDraft } from "./wechat.js";
import { buildArticle } from "./build-article.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const mediaId = requireArg(args, "media-id");
const index = Number(args.index || 0);
if (!Number.isInteger(index) || index < 0) {
  throw new Error("--index must be a non-negative integer");
}
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

const config = getConfig();
const { accessToken, article } = await buildArticle({ args, config, rootDir });
const result = await updateDraft(accessToken, mediaId, index, article);

console.log(JSON.stringify(result, null, 2));
