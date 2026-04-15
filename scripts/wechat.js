import fs from "node:fs";
import path from "node:path";

const API = "https://api.weixin.qq.com";

export async function getStableAccessToken(config, rootDir) {
  const cachePath = path.join(rootDir, "token-cache.json");
  const now = Math.floor(Date.now() / 1000);

  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    if (cached.access_token && cached.expires_at && cached.expires_at - 120 > now) {
      return cached.access_token;
    }
  }

  const res = await fetch(`${API}/cgi-bin/stable_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credential",
      appid: config.appid,
      secret: config.appsecret,
      force_refresh: false,
    }),
  });
  const data = await res.json();
  assertWechatOk(data, "get stable access_token");

  fs.writeFileSync(
    cachePath,
    JSON.stringify(
      {
        access_token: data.access_token,
        expires_at: now + Number(data.expires_in || 7200),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );

  return data.access_token;
}

export async function uploadContentImage(accessToken, imagePath) {
  const form = new FormData();
  const buffer = fs.readFileSync(imagePath);
  form.append("media", new Blob([buffer]), path.basename(imagePath));

  const url = `${API}/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();
  assertWechatOk(data, `upload content image ${imagePath}`);
  if (!data.url) {
    throw new Error(`upload content image missing url: ${JSON.stringify(data)}`);
  }
  return data.url;
}

export async function uploadPermanentImage(accessToken, imagePath) {
  const form = new FormData();
  const buffer = fs.readFileSync(imagePath);
  form.append("media", new Blob([buffer]), path.basename(imagePath));

  const url = `${API}/cgi-bin/material/add_material?access_token=${encodeURIComponent(accessToken)}&type=image`;
  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();
  assertWechatOk(data, `upload cover ${imagePath}`);
  if (!data.media_id) {
    throw new Error(`upload cover missing media_id: ${JSON.stringify(data)}`);
  }
  return data.media_id;
}

export async function addDraft(accessToken, article) {
  const url = `${API}/cgi-bin/draft/add?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ articles: [article] }),
  });
  const data = await res.json();
  assertWechatOk(data, "add draft");
  return data;
}

export async function getDraft(accessToken, mediaId) {
  const url = `${API}/cgi-bin/draft/get?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ media_id: mediaId }),
  });
  const data = await res.json();
  assertWechatOk(data, "get draft");
  return data;
}

export async function updateDraft(accessToken, mediaId, index, article) {
  const url = `${API}/cgi-bin/draft/update?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      media_id: mediaId,
      index,
      articles: article,
    }),
  });
  const data = await res.json();
  assertWechatOk(data, "update draft");
  return data;
}

export function assertWechatOk(data, label) {
  if (typeof data.errcode === "number" && data.errcode !== 0) {
    throw new Error(`${label} failed: ${data.errcode} ${data.errmsg || ""}`);
  }
}
