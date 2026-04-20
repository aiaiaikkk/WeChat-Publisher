# SVG Cover Studio

[English](./README.md) | [简体中文](./README.zh-CN.md)

`svg-cover-studio` 是一个面向本地工作流、与具体 Agent 解耦的 SVG 封面生成工具包，适合开发者内容的封面图、头图、社交卡片和轻量技术视觉图制作。

它的目标不是绑定某一个模型或扩展运行时，而是让 Codex、OpenClaw、Hermes、Claude、Gemini 或其他能读取规则并编辑文件的 Agent，都可以复用同一套规则、模板和脚本。

本项目基于并改造自 [`zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)，重点是把其中可复用的设计思路、校验逻辑和 SVG 工作流，整理成一个更适合本地多 Agent 协作的独立仓库。

## 项目包含什么

- 一个可直接复用的本地 skill 入口：`SKILL.md`
- 深色科技风与浅色极简风视觉规范
- 平台尺寸和封面画布配置
- SVG 校验与自动修复脚本
- 一个起步模板 SVG

## 目录结构

```text
svg-cover-studio/
├── SKILL.md
├── references/
├── resources/
├── scripts/
└── templates/
```

## 适用场景

- 公众号封面
- 16:9 文章头图
- 4:3 知识卡片封面
- 开发者工具宣传图
- AI / 编程 / API / 架构相关文章视觉图

## 快速开始

### 1. 直接使用规则生成 SVG

打开 [`SKILL.md`](./SKILL.md)，让你的本地 Agent 按照其中规则来生成或修改 SVG 封面。

### 2. 校验 SVG

```bash
python3 scripts/svg_validator.py --svg your-cover.svg --json
```

### 3. 修复常见问题

```bash
python3 scripts/svg_fixer.py --svg your-cover.svg --errors E_A11Y_MISSING
```

### 4. 如果环境支持，导出 PNG

```bash
python3 scripts/optimize_and_convert.py your-cover.svg --format all
```

## 环境说明

核心 SVG 工作流本身不依赖额外图形软件，直接基于文件编辑即可。

如果你想启用更完整的优化与导出流程，可以安装这些可选工具：

- `svgo`
- `cairosvg`
- `@resvg/resvg-js`

可通过下面命令检查环境：

```bash
python3 scripts/setup_doctor.py --json
```

## 默认设计方向

这个仓库当前尤其擅长：

- 大标题高可读性封面
- 技术文章头图构图
- 科技暗黑风视觉
- 代码原生生成与迭代修改

## 致谢

特别感谢源项目 `svg-architect` 提供的设计方向、Prompt 结构思路、校验辅助脚本和 SVG 工作流灵感。

源项目仓库：

- 项目名称：`svg-architect`
- 仓库地址：[`https://github.com/zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)

当前仓库是一个独立适配后的本地多 Agent 版本，目标是在保留可迁移设计系统、模板与校验能力的同时，移除与单一 Agent 运行时和作者个人机器路径的强绑定。
