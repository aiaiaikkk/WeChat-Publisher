# WeChat Draft Tools

本工具用于把本地 Markdown / HTML 内容整理后写入微信公众号草稿箱。

## 给 Agent 用的快速接入方式

如果你希望把这个项目交给 OpenClaw、Codex 之类的 Agent 自动配置，推荐让 Agent 按下面顺序执行：

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

常用参数：

- `--title`：文章标题，必填
- `--file`：正文文件，支持 Markdown 或 HTML，必填
- `--cover`：封面图，必填；会上传为永久素材并作为 `thumb_media_id`
- `--digest`：摘要，可选；不传时自动从正文截取
- `--author`：作者，可选；不传时使用 `.env` 中的 `WECHAT_AUTHOR`
- `--source-url`：阅读原文链接，可选

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

说明：

- `--media-id`：已有草稿的 `media_id`
- `--index`：要更新第几篇，单图文一般是 `0`
- `--title`、`--file`、`--cover`：和新建草稿一致

## 注意

- 不要把 `.env` 提交到 Git。
- 正文图片会走“上传发表内容中的图片”接口。
- 封面图会走“上传永久素材”接口，并生成 `thumb_media_id`。
- 创建草稿走 `draft/add` 接口。
