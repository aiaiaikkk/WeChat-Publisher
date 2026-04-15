import fs from "node:fs";
import path from "node:path";
import {
  getStableAccessToken,
  uploadContentImage,
  uploadPermanentImage,
} from "./wechat.js";
import { renderArticleHtml, makeDigest } from "./markdown.js";

export async function buildArticle({ args, config, rootDir }) {
  const articleType = normalizeArticleType(args["article-type"]);
  const title = args.title;
  const file = args.file;
  if (!title) {
    throw new Error("Missing --title");
  }
  if (!file) {
    throw new Error("Missing --file");
  }

  const token = await getStableAccessToken(config, rootDir);
  const content = await renderArticleHtml(file, token);
  const sourceText = fs.readFileSync(path.resolve(file), "utf8");
  const article = {
    article_type: articleType,
    title,
    content,
    need_open_comment: config.needOpenComment,
    only_fans_can_comment: config.onlyFansCanComment,
  };

  if (articleType === "news") {
    const cover = args.cover;
    if (!cover) {
      throw new Error("Missing --cover for article_type=news");
    }
    const thumbMediaId = await uploadPermanentImage(token, cover);
    Object.assign(article, {
      title,
      author: args.author || config.author,
      digest: args.digest || makeDigest(sourceText),
      content_source_url: args["source-url"] || "",
      thumb_media_id: thumbMediaId,
    });
  } else if (articleType === "newspic") {
    const image = args.image || args.cover;
    if (!image) {
      throw new Error("Missing --image (or --cover) for article_type=newspic");
    }
    const imageMediaId = await uploadPermanentImage(token, image);
    article.image_info = {
      image_list: [
        {
          image_media_id: imageMediaId,
        },
      ],
    };
    if (args["cover-image"]) {
      const coverImageMediaId = await uploadContentImage(token, args["cover-image"]);
      article.cover_info = {
        cover_image_url: coverImageMediaId,
      };
    }
  }

  return {
    accessToken: token,
    article,
  };
}

function normalizeArticleType(value) {
  const type = String(value || "news").trim().toLowerCase();
  if (type === "news" || type === "newspic") {
    return type;
  }
  throw new Error(`Unsupported --article-type: ${value}. Expected news or newspic.`);
}
