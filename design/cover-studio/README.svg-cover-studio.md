# SVG Cover Studio in WeChat Publisher

This directory contains the integrated SVG cover workflow used by `WeChat-Publisher`.

It is responsible for code-native cover generation, validation, repair, and export. The goal is to keep article covers, social cards, and technical headers in the same repository as draft generation and WeChat publishing, instead of maintaining a separate cover toolchain.

This module is adapted from and inspired by [`zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect), then further simplified for the `WeChat-Publisher` workflow.

## What It Includes

- A reusable local rule entry: `SKILL.md`
- Tech-dark and light visual specs
- Platform and cover-size profiles
- SVG validation and auto-fix scripts
- A starter SVG template

## Project Structure

```text
design/cover-studio/
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

Open [`SKILL.md`](./SKILL.md) and let your local agent follow it while generating or editing an SVG cover inside `WeChat-Publisher`.

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

The core SVG workflow works with plain file editing and fits naturally into the same repository that already manages article drafts and WeChat publishing.

Optional export/optimization tools:

- `svgo`
- `cairosvg`
- `@resvg/resvg-js`

Check your environment with:

```bash
python3 scripts/setup_doctor.py --json
```

## Design Direction

Default strengths in the `WeChat-Publisher` context:

- large readable headlines
- strong cover composition
- tech-dark engineering aesthetic
- code-native editing and iteration

## Acknowledgements

Special thanks to the original `svg-architect` project for the design direction, prompt structure ideas, validation helpers, and reusable SVG workflow inspiration.

Source project:

- Project name: `svg-architect`
- Repository: [`https://github.com/zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)

Inside `WeChat-Publisher`, this module serves as the internal cover generation layer. It keeps the durable design system, templates, and validation helpers while staying aligned with the publishing workflow.
