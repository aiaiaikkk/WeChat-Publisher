# Windows 部署 HermesAgent 小白手摸手教程（含免费 API 接入）

如果你想在 Windows 上把 HermesAgent 跑起来，而且最好还能接上微信直接聊天，这篇可以直接照着做。

整套流程不复杂，核心就是 4 件事：

- 先在 Windows 上装好 WSL 和 Ubuntu
- 再用 Hermes 官方一键命令完成安装
- 接入一个可用的 OpenAI 兼容 API
- 最后把 Hermes 接到微信里

这篇教程尽量按“看图就能做”的方式来写，适合第一次接触这类 Agent 的朋友。

## 一、开始之前先准备这 3 样

- 一台能联网的 Windows 电脑
- 一个可用的 API 服务
- 一个可扫码登录的微信号

如果你只是想学习和测试，文中也给了两种免费 API 的接入思路。

如果你打算长期稳定使用，还是建议选一个更稳的服务。文中提到的小编常用服务是：`https://superaiapi.top/`

## 二、先在 Windows 安装 WSL 和 Ubuntu

第一步是在 Windows 里打开管理员 PowerShell，然后执行下面这条命令：

```powershell
wsl --install -d Ubuntu
```

![安装 WSL](../../Desktop/feishu/windows部署hermes/1安装wsl.png)

系统会自动下载和安装 Ubuntu，这一步主要就是等。

![等待系统安装](../../Desktop/feishu/windows部署hermes/2等待系统安装.png)

安装完成后，会让你设置 Ubuntu 的用户名和密码。

这里有一个新手常见误区：输入密码时，终端里通常不会显示任何字符，这是正常现象，不是卡住了。

![设置 Ubuntu 账户和密码](../../Desktop/feishu/windows部署hermes/3设置账户名和密码.png)

## 三、执行 Hermes 官方一键部署命令

进入 Ubuntu 终端后，直接执行 Hermes 官方一键安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

![执行官方安装命令](../../Desktop/feishu/windows部署hermes/4使用官方快速部署命令开始部署.png)

接下来 Hermes 会自动安装环境依赖。这个阶段一般要等 10 到 30 分钟，属于正常范围。

![等待依赖安装](../../Desktop/feishu/windows部署hermes/5等待安装环境依赖等大概10-30分钟.png)

安装完成后，会进入 Hermes 的初始化配置界面。

![安装完成开始配置](../../Desktop/feishu/windows部署hermes/6安装完成开始配置.png)

这里直接选择推荐项：

- `Quick setup — provider, model & messaging (recommended)`

## 四、配置模型接口

这是最关键的一步，因为 Hermes 必须先接上模型，才能真正对话。

先在 provider 列表里选择：

- `Custom endpoint`

![选择 Custom endpoint](../../Desktop/feishu/windows部署hermes/7选择custom.png)

然后先输入 `Base URL`。

本教程示例使用的是：

```text
https://api-inference.modelscope.cn/v1
```

![输入 Base URL](../../Desktop/feishu/windows部署hermes/8使用我们之前介绍的平台魔塔的api- inference.png)

接着，再去 ModelScope 后台复制 API 令牌，回到命令行继续粘贴。

也就是说，这里的实际顺序是：

- 先填 `API Base URL`
- 再填 `API Key`

![复制 API 令牌](../../Desktop/feishu/windows部署hermes/复制令牌粘贴.png)

接口验证通过以后，Hermes 会列出当前服务下可选的模型。你只需要输入对应模型前面的数字编号即可。

![选择模型](../../Desktop/feishu/windows部署hermes/9你想用的模型，输入模型前面的数字代码.png)

这里提供了两种免费 API 的接入方式，供学习和测试使用。

第一种：
[https://mp.weixin.qq.com/s/VroyqUK6IAWX6DeqKyOu2A](https://mp.weixin.qq.com/s/VroyqUK6IAWX6DeqKyOu2A)

第二种：
[https://mp.weixin.qq.com/s/YDNPQiPFpJ8XnuRktCwD0A](https://mp.weixin.qq.com/s/YDNPQiPFpJ8XnuRktCwD0A)

如果你需要作为工作之用长期使用，还是更建议选一个稳定的 API 服务。

## 五、先跳过消息平台，优先验证模型是否跑通

Hermes 接下来会问你，要不要立刻连接消息平台。

这里建议先选：

- `Skip`

这样做的好处是先把模型本身跑通，出了问题也更容易排查。

![先跳过消息平台](../../Desktop/feishu/windows部署hermes/10选择skip.png)

之后会提示是否启动 Hermes 聊天界面，直接输入：

```bash
y
```

![输入 y 启动 Hermes TUI](../../Desktop/feishu/windows部署hermes/11输入y启动hermes tui.png)

进入聊天界面后，随便发一句测试话，比如：

```text
你好
```

只要能收到正常回复，就说明模型已经接通成功。

![模型配置成功](../../Desktop/feishu/windows部署hermes/12输入文本有回复就说明模型配置成功了.png)

## 六、继续接入微信

模型验证完成后，退出当前聊天界面，回到命令行执行：

```bash
hermes gateway setup
```

![运行 hermes gateway setup](../../Desktop/feishu/windows部署hermes/13退出tui命令行输入hermes gateway setup.png)

在平台列表中选择：

- `Weixin / WeChat`

![选择微信](../../Desktop/feishu/windows部署hermes/14选择weixin.png)

随后 Hermes 会生成一个登录链接。把链接复制到浏览器打开，再用手机微信扫码。

![复制链接到浏览器](../../Desktop/feishu/windows部署hermes/15复制到浏览器打开链接.png)

![微信扫码](../../Desktop/feishu/windows部署hermes/16打开微信扫码.png)

如果微信提示你当前账号已经绑定过其他 OpenClaw，直接根据自己的情况决定是否继续连接。

![继续连接微信](../../Desktop/feishu/windows部署hermes/22连接微信.png)

扫码之后，权限选项这边按截图来即可：

- 私聊权限选择 `Allow all direct messages`
- 群聊权限选择 `Allow all group chats`

![私聊权限](../../Desktop/feishu/windows部署hermes/17选第2个.png)

![群聊权限](../../Desktop/feishu/windows部署hermes/18继续选第2个.png)

当系统询问是否把当前微信设置为 home channel 时，输入：

```bash
y
```

![确认 home channel](../../Desktop/feishu/windows部署hermes/19输入y.png)

配置结束后选择：

- `Done`

![完成配置](../../Desktop/feishu/windows部署hermes/20done.png)

## 七、真正启动微信网关

这里只做完 `setup` 还不够，真正让微信通道跑起来，还要再执行一次：

```bash
hermes gateway run
```

![运行 gateway](../../Desktop/feishu/windows部署hermes/21运行hermes gateway run.png)

这是非常关键的一步。很多人以为做到 `hermes gateway setup` 就结束了，其实真正让微信可用的是这一条运行命令。

## 八、最后到微信里做一次验证

现在打开手机微信，找到 HermesAgent 对话框，发一条测试消息，比如：

```text
你是谁，现在跑的什么模型，服务商是谁
```

如果它能正常回答模型、服务商、运行环境这些信息，就说明整套流程已经打通了。

![微信里验证成功](../../Desktop/feishu/windows部署hermes/23配置成功.png)

## 九、最后给新手的 3 个提醒

- WSL 安装慢很正常，不要着急中断
- API 配置顺序记住是先 `Base URL`，再 `API Key`
- 微信接入做完 `setup` 后，还要记得执行 `hermes gateway run`

如果你是第一次部署这类 Agent，最稳的顺序就是：

- 先装系统环境
- 再跑通本地模型对话
- 最后再接微信

照着这个顺序来，出问题也更容易定位。
