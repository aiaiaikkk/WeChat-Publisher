# WeChat Draft Tools

本工具用于把本地 Markdown / HTML 内容整理后写入微信公众号草稿箱，并且可以与飞书 CLI 一起组成“先飞书、后微信”的 Agent 工作流。

当前支持的微信草稿类型：

- `news`：图文消息草稿
- `newspic`：图片消息草稿

## 给 Agent 用的快速接入方式

如果你希望把这个项目交给 Agent 自动安装和配置，推荐按下面方式告诉你的 AI 工具。

### 第一步：先安装飞书 CLI

Agent 自动安装。将以下指令直接复制发送给你的 AI 工具（如 TRAE、Cursor、Codex、Claude Code），让它替你完成安装：

```text
帮我安装飞书 CLI：https://github.com/larksuite/cli
```

### 第二步：再安装并配置本项目

安装好飞书 CLI 之后，再把下面这段指令交给你的 AI 工具继续执行：

```bash
npm install
npm run setup
npm run doctor
```

说明：

- `npm run setup`：自动生成 `.env`
- `npm run doctor`：检查 Node 版本、`.env` 配置、以及微信 token 连通性
- 如果 `doctor` 报 `40164 invalid ip ... not in whitelist`，说明当前机器出口 IP 还没有加入公众号后台白名单

项目里也提供了给 Agent 看的说明文件：

- `AGENTS.md`

## 飞书集成方式

本项目不内置飞书代码实现，而是推荐直接使用飞书官方提供的 CLI 安装方式：

使用以下方式写安装方式：

`Agent 自动安装。将以下指令直接复制发送给你的 AI 工具（如 TRAE、Cursor、Codex、Claude Code），让它替你完成安装：`

```text
帮我安装飞书 CLI：https://github.com/larksuite/cli
```

参考文档：

- https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu

推荐安装顺序：

1. 先按飞书官方文档安装并配置飞书 CLI
2. 再安装本项目并配置微信相关能力

这样做的好处是：

- 飞书能力保持官方标准安装方式，后续升级更稳
- 本项目只负责微信草稿能力，不和飞书实现耦合
- Agent 可以先用飞书处理素材、文档、协作，再调用本项目投递到微信草稿箱

## 准备

复制 `.env.example` 为 `.env`，填写公众号配置：

```bash
cp .env.example .env
```

也可以直接执行：

```bash
npm run setup
```

需要的配置：

- `WECHAT_APPID`
- `WECHAT_APPSECRET`
- `WECHAT_AUTHOR`
- `WECHAT_NEED_OPEN_COMMENT`
- `WECHAT_ONLY_FANS_CAN_COMMENT`

## 安装依赖

```bash
npm install
```

要求：

- Node.js `>= 20`

## 自检

在真正创建草稿前，建议先跑一次：

```bash
npm run doctor
```

它会检查：

- Node.js 版本
- `.env` 是否存在
- `WECHAT_APPID` / `WECHAT_APPSECRET` 是否已经填写
- 是否能成功获取微信 `stable access_token`

## 检查 access_token

```bash
npm run token
```

如果返回 `40164 invalid ip ... not in whitelist`，说明当前电脑或服务器的出口 IP 没有加入公众号后台的 IP 白名单。

需要到公众号后台配置：

- 进入公众号后台
- 打开开发相关配置
- 找到 `IP 白名单`
- 加入报错里提示的出口 IP
- 保存后重新执行 `npm run token`

## 创建草稿

最小命令：

```bash
npm run draft -- --title "标题" --file examples/article.md --cover ./cover.png
```

如果要创建图片消息草稿：

```bash
npm run draft -- --article-type newspic --title "标题" --file examples/article.md --image ./cover.png
```

常用参数：

- `--article-type`：草稿类型，可选 `news` 或 `newspic`，默认 `news`
- `--title`：文章标题，必填
- `--file`：正文文件，支持 Markdown 或 HTML，必填
- `--cover`：图文消息封面图；`news` 类型必填，也可兼作 `newspic` 的图片素材
- `--image`：图片消息素材；`newspic` 类型推荐使用
- `--cover-image`：图片消息可选封面图 URL 来源文件，会上传后写入 `cover_info`
- `--digest`：摘要，可选；不传时自动从正文截取
- `--author`：作者，可选；不传时使用 `.env` 中的 `WECHAT_AUTHOR`
- `--source-url`：阅读原文链接，可选

类型差异：

- `news`：需要封面图，会生成 `thumb_media_id`
- `newspic`：不需要 `digest`、`author`、`content_source_url`、`thumb_media_id`，而是写入 `image_info.image_list`

## 正文图片

公众号正文图片不能直接使用外链。正文中可以使用本地图片路径：

```markdown
![示例图](./images/demo.png)
```

创建草稿时，脚本会自动上传本地图片，并替换为微信返回的图片 URL。

## 读取草稿详情

根据 `media_id` 读取草稿，方便确认草稿内容：

```bash
npm run get-draft -- --media-id "草稿 media_id"
```

## 更新已有草稿

如果只想修改已有草稿，不想每次新建，可以使用：

```bash
npm run update-draft -- --media-id "草稿 media_id" --index 0 --title "标题" --file examples/article.md --cover ./cover.png
```

更新图片消息草稿示例：

```bash
npm run update-draft -- --media-id "草稿 media_id" --index 0 --article-type newspic --title "标题" --file examples/article.md --image ./cover.png
```

说明：

- `--media-id`：已有草稿的 `media_id`
- `--index`：要更新第几篇，单图文一般是 `0`
- `--title`、`--file`、`--cover` / `--image`：和新建草稿一致

## 注意

- 不要把 `.env` 提交到 Git。
- 正文图片会走“上传发表内容中的图片”接口。
- 封面图会走“上传永久素材”接口，并生成 `thumb_media_id`。
- 图片消息素材同样会走“上传永久素材”接口，并写入 `image_info.image_list`。
- 创建草稿走 `draft/add` 接口。
