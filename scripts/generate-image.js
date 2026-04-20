import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./args.js";
import { loadEnv, getSuperaiapiConfig } from "./env.js";
import { generateImage } from "./superaiapi.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(rootDir);

const args = parseArgs(process.argv);
const prompt = requireArg(args, "prompt");
const output = requireArg(args, "output");
const inputImages = String(args.images || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const result = await generateImage({
  config: getSuperaiapiConfig({ required: true }),
  provider: args.provider || "nano-banana2",
  prompt,
  output,
  aspectRatio: args["aspect-ratio"] || "16:9",
  imageSize: args["image-size"] || "1K",
  inputImages,
});

console.log(JSON.stringify(result, null, 2));
