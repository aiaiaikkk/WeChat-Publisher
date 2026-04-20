---
name: svg-cover-studio
description: Create or refine local SVG cover images, article headers, social cards, and tech-style visual assets. Use when the task is to generate an SVG cover, convert a title into a polished visual, adapt an existing SVG into another aspect ratio, or validate/fix SVG quality for Codex, OpenClaw, Hermes, Claude, Gemini, or other local agents.
---

# SVG Cover Studio

Use this skill when the user wants a cover image, article header, social card, visual title graphic, or other code-generated SVG asset that should be produced locally and edited as files.

This skill is a local, agent-agnostic adaptation of the upstream `svg-architect` project. Keep the parts that are durable:

- clear scene sizing
- high-readability title composition
- tech-dark and light visual specs
- SVG validation and repair scripts

Do not assume Gemini CLI, extension installs, or any fixed machine-specific output path.

## Quick workflow

1. Identify the scene:
   - `wechat_cover`: `1800x766`
   - `article_16_9`: `1920x1080`
   - `x_card` or generic card: `1200x630`
   - custom ratio if the user explicitly asks
2. Identify the visual mode:
   - `tech_dark` for dark, neon, engineering style
   - `apple_light` for clean, bright, restrained style
3. Distill the content:
   - one main title
   - optionally one short subtitle
   - at most one compact supporting panel or data motif
4. Choose or create an organized output directory before writing any files.
5. Generate or edit the SVG locally.
6. Validate if needed with `scripts/svg_validator.py`.
7. If exporting to PNG is requested, use `scripts/optimize_and_convert.py` or a local conversion path.
8. Verify the final PNG dimensions and visually inspect the rendered PNG before delivery.

## Output organization rules

Do not write generated cover files directly into a user's home-directory root or another unscoped global location.

Before creating files, choose a workspace root in this order:

1. A user-provided output directory.
2. The current project repository or active working directory.
3. A clearly named local content workspace created in the current working directory.

Default output layout:

```text
<workspace-root>/content-workspace/<article-slug>/
  covers/       SVG and exported PNG cover assets
  drafts/       Markdown drafts and intermediate copy
  screenshots/  User-provided screenshots used by the article
  exports/      Final files prepared for upload or delivery
```

Use a short ASCII `article-slug` derived from the topic, for example:

- `hermes-no-magic`
- `nvidia-hermes-openclaw`
- `codex-offline-guide`

File naming:

- Use lowercase ASCII names with hyphens.
- Include the format or ratio in the filename, such as `cover-16x9.svg`, `cover-4x3.png`, or `cover-wechat.png`.
- If variants are needed, add a style suffix such as `cover-wechat-dark.png`.
- Keep source SVG and exported PNG together in the same `covers/` folder.

Temporary or exploratory assets:

- Put temporary files under `drafts/` or a clearly named subfolder such as `drafts/tmp/`.
- Before final delivery, remove or archive failed variants instead of leaving them in the workspace root.

## Design rules

- Prioritize thumbnail readability over decorative detail.
- Prefer one strong idea per graphic.
- Keep at least roughly 35% to 40% visual breathing room.
- For cover art, large title text should dominate.
- Avoid cluttered grids, dense labels, or tiny explanatory copy unless the user asked for an infographic.
- Use ASCII in file names unless the user explicitly wants otherwise.
- Final deliverables must not contain process text such as `style`, `version`, `wechat cover`, `poster`, `适合...`, `方案一`, or any other internal design notes unless the user explicitly asks for those labels inside the artwork.
- Treat the output as a finished asset, not a mockup. Remove explanatory helper text that describes the design process rather than the reader-facing message.
- Supporting panels, architecture cards, and side annotations are optional. Do not add them by default when the user wants a clean headline cover.
- For multi-line Chinese headlines, prefer separate `<text>` elements with explicit `y` positions over complex `tspan` line breaking when the asset may be rasterized by macOS-native SVG renderers.

## Layout defaults

### WeChat cover

- Size: `1800x766`
- Use a wide composition with generous side margins.
- Keep important text away from the far left and far right edges.

### 16:9 article cover

- Size: `1920x1080`
- Use a two-zone layout:
  - left or center-left for the headline
  - right side for one compact visual panel, chart, or motif

### 4:3 cover

- Common working size: `1600x1200`
- Allow more vertical stacking than 16:9.

## Style selection

Read the matching reference only when needed:

- Tech dark: [references/tech_dark.md](references/tech_dark.md)
- Apple light: [references/apple_light.md](references/apple_light.md)

Use `tech_dark` by default for topics like:

- AI
- coding
- agents
- APIs
- architecture
- developer tools

Use `apple_light` for topics like:

- product explainers
- strategy
- editorial visuals
- calm premium brand tone

## Reusable assets

- Template starter: [templates/article_cover_tech.svg](templates/article_cover_tech.svg)
- Prompt structure reference: [references/prompt_template.md](references/prompt_template.md)
- Platform sizes: [resources/platform_profiles.json](resources/platform_profiles.json)

## Validation and repair

Use these scripts when the asset is important, reused, or exported broadly:

- Doctor environment:
  - `python3 scripts/setup_doctor.py`
- Validate SVG:
  - `python3 scripts/svg_validator.py --svg <file> --json`
- Repair common issues:
  - `python3 scripts/svg_fixer.py --svg <file> --errors E_A11Y_MISSING`
- Optimize and optionally export PNG:
  - `python3 scripts/optimize_and_convert.py <file.svg> --format all`

## Export safety rules

- Do not treat Quick Look thumbnail output from `qlmanage -t` as a final delivery asset. It may generate square thumbnails that do not preserve the intended aspect ratio.
- After PNG export, always verify the raster output dimensions with a tool such as `sips -g pixelWidth -g pixelHeight`.
- Always visually inspect the exported PNG, not just the SVG source, because native renderers may break multi-line text layout or font fallback.
- If a PNG render shows broken line wrapping, replace multi-line `tspan` usage with separate positioned `text` nodes and re-export.

## Important local adaptation notes

- Never write files to a hard-coded author-specific path.
- Save outputs under `<workspace-root>/content-workspace/<article-slug>/` unless the user requested another path.
- If the current working directory is a home-directory root, create or use a clearly named project/content folder first instead of writing generated assets directly there.
- Do not require Gemini extensions or any specific agent runtime.
- These scripts are helpers; direct SVG editing is still allowed and often faster for one-off cover generation.

## When adapting an existing SVG

- Preserve the title hierarchy first.
- Reflow supporting panels instead of scaling everything uniformly.
- If converting ratios, keep the headline block optically balanced rather than mathematically centered at all costs.
- Remove details before shrinking type.

## Deliverables

When you complete a request with this skill, prefer delivering:

- the SVG source file
- a PNG export if asked
- one short note on what visual direction was chosen

Before delivering, confirm:

- no process or placeholder wording appears inside the artwork
- the exported PNG aspect ratio matches the requested scene
- the PNG has been visually checked for text reflow or clipping
