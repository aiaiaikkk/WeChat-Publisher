# WeChat Publisher

这个项目用来把内容发送到微信公众号草稿箱。

目前支持：

- 图文消息草稿
- 图片消息草稿

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

如果 `doctor` 提示 IP 白名单问题，还需要：

- 去公众号后台把当前机器的出口 IP 加到白名单

## 用户装好以后可以做什么

装好以后，用户就可以让 Agent 帮他：

- 创建微信公众号草稿
- 更新已有草稿
- 把 Markdown / HTML 内容整理后发送到草稿箱
- 上传封面图和正文图片

## 说明

- 飞书部分使用官方 CLI 安装方式
- 微信部分由本项目负责
- 推荐顺序：先飞书，再微信
