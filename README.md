# WeChat Publisher

这个项目用来把内容发送到微信公众号草稿箱。

目前支持：

- 图文消息草稿
- 图片消息草稿
- 通过 SuperAIAPI 生成图像
- 配合 Feishu CLI 使用飞书相关能力

## 安装方式

建议用 Agent 自动安装。

### 第一步：先安装飞书 CLI

将下面这句话直接发给你的 AI 工具（如 TRAE、Cursor、Codex、Claude Code）：

```text
帮我安装飞书 CLI：https://github.com/larksuite/cli
```

### 第二步：再安装本项目

将下面这句话直接发给你的 AI 工具：

```text
帮我安装并配置 WeChat Publisher：https://github.com/aiaiaikkk/WeChat-Publisher
```

## 用户需要提供什么

用户需要提供：

- 微信公众号的 `AppID`
- 微信公众号的 `AppSecret`
- SuperAIAPI 的 `API Key`（用于图像和后续视频生成）

如果 `doctor` 提示 IP 白名单问题，还需要：

- 去公众号后台把当前机器的出口 IP 加到白名单

## 用户装好以后可以做什么

装好以后，用户就可以让 Agent 帮他：

- 使用飞书 CLI 处理飞书文档、素材和协作相关工作
- 创建微信公众号草稿
- 更新已有草稿
- 把 Markdown / HTML 内容整理后发送到草稿箱
- 上传封面图和正文图片
- 使用 `nano-banana2` 或 `gpt-image-2` 生成封面和配图

## 图像生成

配置好 `SUPERAIAPI_API_KEY` 后，可以生成图片：

```bash
npm run image -- \
  --provider nano-banana2 \
  --prompt "一张科技感公众号封面，主题是 AI Agent 部署教程" \
  --aspect-ratio 16:9 \
  --image-size 1K \
  --output ./outputs/cover.png
```

当前支持：

- `nano-banana2`：对应 `gemini-3.1-flash-image-preview`
- `gpt-image-2`：对应 `gpt-image-2-all`

注意：图像模型生成中文标题文字并不稳定。正式公众号封面建议让模型生成背景、主体和氛围，再用 SVG / HTML / 图片编辑脚本叠加准确标题。

如果需要图生图，可以给 `nano-banana2` 传入本地图片：

```bash
npm run image -- \
  --provider nano-banana2 \
  --prompt "参考这张截图，生成一张更适合公众号的封面" \
  --images ./examples/reference.png \
  --aspect-ratio 16:9 \
  --output ./outputs/cover.png
```

`gpt-image-2` 也支持用 `--images` 进入图片编辑接口：

```bash
npm run image -- \
  --provider gpt-image-2 \
  --prompt "把参考图改成更适合公众号封面的科技风图片" \
  --images ./examples/reference.png \
  --aspect-ratio 16:9 \
  --output ./outputs/cover-gpt.png
```

常用比例：

- `1:1`：方图
- `16:9`：横版封面
- `9:16`：竖版海报

实测结果：

- `nano-banana2` 文生图可用
- `nano-banana2` 图生图可用
- `gpt-image-2` 文生图可用
- `gpt-image-2` 图生图可用

## 创作公众号文章的最佳实践

推荐流程：

1. 先在飞书文档里写文章
2. 在飞书里完成排版和审核
3. 再让 Agent 帮你发布到微信草稿箱，并完成适合公众号的排版整理

## 说明

- 飞书部分使用官方 CLI 安装方式
- 微信部分由本项目负责
- 推荐顺序：先飞书，再微信
