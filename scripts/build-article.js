import fs from "node:fs";
import path from "node:path";
import { getStableAccessToken, uploadPermanentImage } from "./wechat.js";
import { renderArticleHtml, makeDigest } from "./markdown.js";

export async function buildArticle({ args, config, rootDir }) {
  const title = args.title;
  const file = args.file;
  const cover = args.cover;
  if (!title) {
    throw new Error("Missing --title");
  }
  if (!file) {
    throw new Error("Missing --file");
  }
  if (!cover) {
    throw new Error("Missing --cover");
  }

  const token = await getStableAccessToken(config, rootDir);
  const content = await renderArticleHtml(file, token);
  const sourceText = fs.readFileSync(path.resolve(file), "utf8");
  const thumbMediaId = await uploadPermanentImage(token, cover);

  return {
    accessToken: token,
    article: {
      article_type: "news",
      title,
      author: args.author || config.author,
      digest: args.digest || makeDigest(sourceText),
      content,
      content_source_url: args["source-url"] || "",
      thumb_media_id: thumbMediaId,
      need_open_comment: config.needOpenComment,
      only_fans_can_comment: config.onlyFansCanComment,
    },
  };
}

