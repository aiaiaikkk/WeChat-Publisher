import fs from "node:fs";
import path from "node:path";
import { uploadContentImage } from "./wechat.js";

export async function renderArticleHtml(filePath, accessToken) {
  const absolute = path.resolve(filePath);
  const baseDir = path.dirname(absolute);
  let markdown = fs.readFileSync(absolute, "utf8");

  markdown = await replaceLocalImages(markdown, baseDir, accessToken);
  return markdownToHtml(markdown);
}

async function replaceLocalImages(markdown, baseDir, accessToken) {
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const replacements = [];
  for (const match of markdown.matchAll(imagePattern)) {
    const [full, alt, src] = match;
    if (/^https?:\/\//i.test(src)) {
      continue;
    }
    const imagePath = path.resolve(baseDir, src);
    const url = await uploadContentImage(accessToken, imagePath);
    replacements.push([full, `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />`]);
  }
  for (const [from, to] of replacements) {
    markdown = markdown.replace(from, to);
  }
  return markdown;
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [
    '<section style="font-size:17px;line-height:1.82;color:#222;letter-spacing:0.2px;">',
  ];
  let paragraph = [];
  let inCode = false;
  let codeLines = [];
  let firstHeadingConsumed = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(
        `<p style="margin:18px 0;color:#2f3437;">${inline(paragraph.join(" "))}</p>`,
      );
      paragraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flushParagraph();
      if (inCode) {
        html.push(renderCodeBlock(codeLines));
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (trimmed.startsWith("<img ")) {
      flushParagraph();
      html.push(`<p style="text-align:center;">${trimmed}</p>`);
      continue;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const title = inline(heading[2]);
      if (level === 1 && !firstHeadingConsumed) {
        firstHeadingConsumed = true;
        continue;
      }
      if (level === 2) {
        html.push(
          `<h2 style="margin:34px 0 14px;padding-left:12px;border-left:4px solid #07c160;font-size:24px;line-height:1.35;color:#111;font-weight:700;">${title}</h2>`,
        );
      } else if (level === 3) {
        html.push(
          `<h3 style="margin:26px 0 10px;font-size:20px;line-height:1.45;color:#1f2328;font-weight:700;">${title}</h3>`,
        );
      } else {
        html.push(
          `<h4 style="margin:22px 0 8px;font-size:18px;line-height:1.45;color:#1f2328;font-weight:700;">${title}</h4>`,
        );
      }
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      html.push(
        `<p style="margin:10px 0 10px 0;color:#2f3437;padding-left:1.2em;text-indent:-1.2em;">• ${inline(bullet[1])}</p>`,
      );
      continue;
    }
    paragraph.push(trimmed);
  }

  flushParagraph();
  if (inCode) {
    html.push(renderCodeBlock(codeLines));
  }
  html.push("</section>");
  return html.join("\n");
}

function renderCodeBlock(lines) {
  return `<pre style="margin:18px 0;padding:14px 16px;background:#f7f8fa;border:1px solid #e7ebf0;border-radius:12px;overflow-x:auto;line-height:1.7;font-size:13px;color:#1f2328;"><code>${escapeHtml(lines.join("\n"))}</code></pre>`;
}

function inline(text) {
  return escapeHtml(text)
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="font-weight:700;color:#111;">$1</strong>',
    )
    .replace(
      /`([^`]+)`/g,
      '<code style="padding:2px 6px;border-radius:6px;background:#f2f4f7;font-size:0.92em;color:#334155;">$1</code>',
    );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function makeDigest(text, max = 120) {
  const plain = text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}
