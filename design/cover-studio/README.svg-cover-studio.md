# SVG Cover Studio

[English](./README.md) | [简体中文](./README.zh-CN.md)

`svg-cover-studio` is a local, agent-agnostic SVG cover generation toolkit for developer content.

It is designed for teams who want to generate and refine cover images, article headers, social cards, and lightweight technical visuals directly from code, without depending on a single model vendor or extension runtime.

This project is adapted from and inspired by [`zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect), with the goal of making the workflow easier to reuse in local multi-agent setups such as Codex, OpenClaw, Hermes, Claude, Gemini, or any other agent that can read prompt rules and edit files.

## What It Includes

- A reusable local skill entry: `SKILL.md`
- Tech-dark and light visual specs
- Platform and cover-size profiles
- SVG validation and auto-fix scripts
- A starter SVG template

## Project Structure

```text
svg-cover-studio/
├── SKILL.md
├── references/
├── resources/
├── scripts/
└── templates/
```

## Typical Use Cases

- WeChat / public account cover images
- 16:9 article headers
- 4:3 knowledge-card covers
- Developer-tool promo graphics
- AI / coding / API / architecture article visuals

## Quick Start

### 1. Use the rules directly

Open [`SKILL.md`](./SKILL.md) and let your local agent follow it while generating or editing an SVG cover.

### 2. Validate an SVG

```bash
python3 scripts/svg_validator.py --svg your-cover.svg --json
```

### 3. Repair common issues

```bash
python3 scripts/svg_fixer.py --svg your-cover.svg --errors E_A11Y_MISSING
```

### 4. Export PNG if your environment supports it

```bash
python3 scripts/optimize_and_convert.py your-cover.svg --format all
```

## Environment Notes

The core SVG workflow works with plain file editing.

Optional export/optimization tools:

- `svgo`
- `cairosvg`
- `@resvg/resvg-js`

Check your environment with:

```bash
python3 scripts/setup_doctor.py --json
```

## Design Direction

Default strengths:

- large readable headlines
- strong cover composition
- tech-dark engineering aesthetic
- code-native editing and iteration

## Acknowledgements

Special thanks to the original `svg-architect` project for the design direction, prompt structure ideas, validation helpers, and reusable SVG workflow inspiration.

Source project:

- Project name: `svg-architect`
- Repository: [`https://github.com/zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)

This repository is an independently adapted local multi-agent version. The goal here is to preserve the durable design system, templates, and validation helpers while removing agent-specific coupling and machine-specific assumptions.
