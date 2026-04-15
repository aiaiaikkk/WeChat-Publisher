# AGENTS.md

This project is designed to be configured by coding agents such as Codex or OpenClaw.

## Goal

Set up a usable WeChat Official Account draft workflow so the user can create, read, and update article drafts after a single setup request.

## Environment Expectations

- Node.js `>= 20`
- Network access available for WeChat Open Platform APIs
- User can provide:
  - `WECHAT_APPID`
  - `WECHAT_APPSECRET`
- The machine's outbound IP may need to be added to the WeChat backend whitelist

## Recommended Agent Flow

1. `npm install`
2. `npm run setup`
3. Ask the user only for missing sensitive values:
   - `WECHAT_APPID`
   - `WECHAT_APPSECRET`
4. Write them into `.env`
5. Run `npm run doctor`
6. If doctor passes, optionally verify with:
   - `npm run draft -- --title "测试标题" --file examples/article.md --cover examples/cover.svg.png`

## Important Rules

- Never commit `.env` or `token-cache.json`
- If token request returns `40164 invalid ip not in whitelist`, stop and tell the user to add the current outbound IP to the WeChat IP whitelist
- Prefer API-based draft creation and update over browser automation
- When using local Markdown images, keep paths valid relative to the article file because they will be uploaded and replaced automatically

## User-Facing Success Criteria

The project is considered configured only when:

- `.env` exists with real values
- `npm run doctor` passes
- The user can run at least one successful draft command
