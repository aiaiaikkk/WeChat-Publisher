import fs from "node:fs";
import path from "node:path";

const PROVIDERS = {
  "nano-banana2": {
    model: "gemini-3.1-flash-image-preview",
    type: "gemini",
  },
  "gpt-image-2": {
    model: "gpt-image-2-all",
    type: "openai-image",
  },
};

export function normalizeImageProvider(provider) {
  const key = String(provider || "nano-banana2").trim().toLowerCase();
  const config = PROVIDERS[key];
  if (!config) {
    throw new Error(
      `Unsupported image provider: ${provider}. Expected one of: ${Object.keys(PROVIDERS).join(", ")}`,
    );
  }
  return {
    key,
    ...config,
  };
}

export async function generateImage({
  config,
  provider,
  prompt,
  output,
  aspectRatio,
  imageSize,
  inputImages = [],
}) {
  if (!prompt) {
    throw new Error("Missing prompt");
  }
  if (!output) {
    throw new Error("Missing output");
  }
  if (!config?.apiKey) {
    throw new Error("Missing SUPERAIAPI_API_KEY in .env");
  }

  const normalized = normalizeImageProvider(provider);
  if (normalized.type === "gemini") {
    return generateGeminiImage({
      config,
      model: normalized.model,
      prompt,
      output,
      aspectRatio,
      imageSize,
      inputImages,
    });
  }
  return generateOpenAIImage({
    config,
    model: normalized.model,
    prompt,
    output,
    aspectRatio,
    imageSize,
    inputImages,
  });
}

async function generateGeminiImage({
  config,
  model,
  prompt,
  output,
  aspectRatio = "16:9",
  imageSize = "1K",
  inputImages,
}) {
  const parts = [{ text: prompt }];
  for (const imagePath of inputImages) {
    parts.push(toGeminiInlineData(imagePath));
  }

  const body = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  const url = `${config.baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await readJson(res, "generate Gemini image");
  const image = findGeminiImage(data);
  writeBase64Image(output, image.data);
  return {
    provider: "nano-banana2",
    model,
    output,
    mimeType: image.mimeType,
  };
}

async function generateOpenAIImage({
  config,
  model,
  prompt,
  output,
  aspectRatio = "16:9",
  inputImages = [],
}) {
  if (inputImages.length > 0) {
    return editOpenAIImage({
      config,
      model,
      prompt,
      output,
      aspectRatio,
      inputImages,
    });
  }

  const body = {
    model,
    prompt,
    n: 1,
    size: openAIImageSize(aspectRatio),
  };

  const res = await fetch(`${config.baseUrl}/v1/images/generations`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await readJson(res, "generate OpenAI image");
  await writeImageResult(output, data, "generate OpenAI image");
  return {
    provider: "gpt-image-2",
    model,
    output,
    mimeType: "image/png",
  };
}

async function editOpenAIImage({
  config,
  model,
  prompt,
  output,
  aspectRatio = "16:9",
  inputImages,
}) {
  const form = new FormData();
  for (const imagePath of inputImages) {
    const buffer = fs.readFileSync(imagePath);
    form.append("image", new Blob([buffer], { type: mimeTypeForPath(imagePath) }), path.basename(imagePath));
  }
  form.append("prompt", prompt);
  form.append("model", model);
  form.append("n", "1");
  form.append("size", openAIImageSize(aspectRatio));

  const res = await fetch(`${config.baseUrl}/v1/images/edits`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: form,
  });
  const data = await readJson(res, "edit OpenAI image");
  await writeImageResult(output, data, "edit OpenAI image");
  return {
    provider: "gpt-image-2",
    model,
    output,
    mimeType: "image/png",
  };
}

function toGeminiInlineData(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return {
    inline_data: {
      mime_type: mimeTypeForPath(imagePath),
      data: buffer.toString("base64"),
    },
  };
}

function findGeminiImage(data) {
  for (const candidate of data?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      const inline = part.inlineData || part.inline_data;
      if (inline?.data) {
        return {
          data: inline.data,
          mimeType: inline.mimeType || inline.mime_type || "image/png",
        };
      }
    }
  }
  throw new Error(`generate Gemini image returned no inline image: ${JSON.stringify(data)}`);
}

function writeBase64Image(output, b64) {
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(output, Buffer.from(b64, "base64"));
}

async function writeImageResult(output, data, label) {
  const b64 = findBase64Image(data);
  if (b64) {
    writeBase64Image(output, b64);
    return;
  }

  const url = findImageUrl(data);
  if (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${label} image url download failed: HTTP ${res.status}`);
    }
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    fs.writeFileSync(output, Buffer.from(await res.arrayBuffer()));
    return;
  }

  throw new Error(`${label} returned no image data or url: ${JSON.stringify(data)}`);
}

function findBase64Image(data) {
  if (data?.data?.[0]?.b64_json) {
    return data.data[0].b64_json;
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    const markdownImage = content.match(/!\[[^\]]*]\(data:image\/[^;]+;base64,([^)]+)\)/);
    if (markdownImage) {
      return markdownImage[1];
    }
    const dataUrl = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (dataUrl) {
      return dataUrl[1];
    }
  }
  return "";
}

function findImageUrl(data) {
  if (data?.data?.[0]?.url) {
    return data.data[0].url;
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    const markdownImage = content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/);
    if (markdownImage) {
      return markdownImage[1];
    }
    const url = content.match(/https?:\/\/\S+/);
    if (url) {
      return url[0].replace(/[)\],.]+$/, "");
    }
  }
  return "";
}

async function readJson(res, label) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label} failed: response was not JSON: ${text}`);
  }
  if (!res.ok || data.error) {
    throw new Error(`${label} failed: HTTP ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

function mimeTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  return "image/png";
}

function openAIImageSize(aspectRatio) {
  const ratio = String(aspectRatio || "1:1");
  if (ratio === "16:9") {
    return "1536x1024";
  }
  if (ratio === "9:16") {
    return "1024x1536";
  }
  return "1024x1024";
}
