# SVG Cover Studio（WeChat Publisher 内部模块）

这个目录是 `WeChat-Publisher` 内部集成的 SVG 封面工作流模块。

它的职责是负责代码原生的封面生成、校验、修复和导出，让封面设计、公众号草稿整理和微信发布都在同一个仓库里完成，而不是分散在多个项目中。

本模块基于并改造自 [`zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)，重点是把其中可复用的设计思路、校验逻辑和 SVG 工作流吸收到 `WeChat-Publisher` 里。

## 项目包含什么

- 一个可直接复用的规则入口：`SKILL.md`
- 深色科技风与浅色极简风视觉规范
- 平台尺寸和封面画布配置
- SVG 校验与自动修复脚本
- 一个起步模板 SVG

## 目录结构

```text
design/cover-studio/
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

打开 [`SKILL.md`](./SKILL.md)，让你的本地 Agent 按照其中规则在 `WeChat-Publisher` 内生成或修改 SVG 封面。

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

核心 SVG 工作流本身不依赖额外图形软件，直接基于文件编辑即可，也方便与公众号正文、封面图和草稿发布工作流保持一致。

如果你想启用更完整的优化与导出流程，可以安装这些可选工具：

- `svgo`
- `cairosvg`
- `@resvg/resvg-js`

可通过下面命令检查环境：

```bash
python3 scripts/setup_doctor.py --json
```

## 默认设计方向

在 `WeChat-Publisher` 场景下，这个模块尤其擅长：

- 大标题高可读性封面
- 技术文章头图构图
- 科技暗黑风视觉
- 代码原生生成与迭代修改

## 致谢

特别感谢源项目 `svg-architect` 提供的设计方向、Prompt 结构思路、校验辅助脚本和 SVG 工作流灵感。

源项目仓库：

- 项目名称：`svg-architect`
- 仓库地址：[`https://github.com/zhaodl1983/svg-architect`](https://github.com/zhaodl1983/svg-architect)

在 `WeChat-Publisher` 中，这个模块承担的是内部封面生成层的职责。它保留了可迁移的设计系统、模板与校验能力，同时与公众号发布工作流深度配合。
