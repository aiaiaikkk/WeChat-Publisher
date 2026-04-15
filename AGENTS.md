# AGENTS.md

This project is designed to be configured by coding agents such as Codex or OpenClaw.

## Goal

Set up a usable content workflow where Feishu is installed first via the official Feishu CLI path, and WeChat draft capability is configured afterwards through this project.

## Environment Expectations

- Node.js `>= 20`
- Network access available for WeChat Open Platform APIs
- User can provide:
  - `WECHAT_APPID`
  - `WECHAT_APPSECRET`
- The machine's outbound IP may need to be added to the WeChat backend whitelist

## Recommended Agent Flow

1. Install Feishu CLI first, following the official Feishu documentation:
   - User-facing install text:
     `Agent 自动安装。将以下指令直接复制发送给你的 AI 工具（如 TRAE、Cursor、Codex、Claude Code），让它替你完成安装：`
   - Instruction:
     `帮我安装飞书 CLI：https://github.com/larksuite/cli`
   - Reference:
     `https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu`
2. `npm install`
3. `npm run setup`
4. Ask the user only for missing sensitive values:
   - `WECHAT_APPID`
   - `WECHAT_APPSECRET`
5. Write them into `.env`
6. Run `npm run doctor`
7. If doctor passes, optionally verify with:
   - `npm run draft -- --title "测试标题" --file examples/article.md --cover examples/cover.svg.png`

## Supported Draft Types

- `news`: standard article draft
- `newspic`: image-message draft

When the user does not specify a type, default to `news`.

## Important Rules

- Never commit `.env` or `token-cache.json`
- Do not reimplement Feishu integration inside this project when the official Feishu CLI installation path is sufficient
- If token request returns `40164 invalid ip not in whitelist`, stop and tell the user to add the current outbound IP to the WeChat IP whitelist
- Prefer API-based draft creation and update over browser automation
- When using local Markdown images, keep paths valid relative to the article file because they will be uploaded and replaced automatically
- For `news`, require `--cover`
- For `newspic`, require `--image` or reuse `--cover`

## User-Facing Success Criteria

The project is considered configured only when:

- `.env` exists with real values
- `npm run doctor` passes
- The user can run at least one successful draft command
