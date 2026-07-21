# Zotero AI Notes

将 Zotero 9 中选中的文献全文或摘要发送到本地 n8n AI 阅读工作流，并由工作流生成 Obsidian 笔记。

[![Zotero 9](https://img.shields.io/badge/Zotero-9.0--9.*-CC2936?style=flat-square&logo=zotero&logoColor=white)](https://www.zotero.org/)
[![Release](https://img.shields.io/github/v/release/luelue-dot/Zotero-AI-Notes?style=flat-square)](https://github.com/luelue-dot/Zotero-AI-Notes/releases)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square)](LICENSE)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

当前版本：**3.1.8**

## 功能

- 适配 Zotero 9.0–9.\*。
- 在文献条目右键菜单中提供 `AI-notes2obsidian`。
- 使用 Zotero PDF 全文索引缓存；必要时请求 Zotero 建立全文索引，但不上传原始 PDF 文件。
- 全文不可用时可降级使用文献摘要。
- 将元数据、全文/摘要和输出选项以单次 JSON POST 发送到 n8n。
- 使用 Zotero 9 原生 `Zotero.HTTP.request()`。
- 每次点击最多发送一次请求，不自动重试。
- 对设置、元数据、全文、请求构造、网络、超时、HTTP 和响应错误进行分类提示。
- 插件不直接写入 Obsidian；实际笔记生成和写盘由 n8n 工作流负责。

## 安装

### 从 GitHub Release 安装

1. 打开 [Releases](https://github.com/luelue-dot/Zotero-AI-Notes/releases)。
2. 下载最新版本的 `zotero-ai-reading.xpi`。
3. 在 Zotero 中打开“工具 → 插件”。
4. 点击右上角齿轮，选择“Install Plugin From File...”。
5. 选择下载的 XPI，安装后完全退出并重新启动 Zotero。

3.1.8 的预期 SHA-256：

```text
BC95911FC67F583146A81D9F4AF5DD546FE7BF66466BEF714AF8D63C627A2D93
```

## 插件设置

在 Zotero 的高级设置/插件设置中打开 `AI-notes2obsidian`：

| 设置            | 默认值                                            | 说明                               |
| --------------- | ------------------------------------------------- | ---------------------------------- |
| Webhook URL     | `http://127.0.0.1:5678/webhook/zotero-ai-reading` | n8n 生产 Webhook 地址              |
| Webhook Token   | 空                                                | 通过 `X-Workflow-Token` 请求头发送 |
| 请求超时        | `180` 秒                                          | n8n 最大等待时间                   |
| 摘要降级        | 启用                                              | PDF 全文不可用时使用摘要           |
| 模板            | `academic_reading_v1`                             | 交给工作流的模板标识               |
| 输出语言        | `zh-CN`                                           | 交给工作流的输出语言               |
| Obsidian 子目录 | `Literature Notes`                                | 交给工作流的目标子目录             |

Token 不会写入源码、构建产物或插件错误日志。

## 使用

1. 在 Zotero 文献库中选择一篇父级普通文献条目。
2. 右键并选择 `AI-notes2obsidian`。
3. 插件读取元数据和 Zotero 全文缓存；全文不可用时按设置使用摘要。
4. 插件向 n8n 发送一次 POST，并等待工作流返回结果。

第一版仅支持单选。不要直接选择 PDF 附件、笔记或批注。

## n8n 请求契约

插件发送：

```http
POST /webhook/zotero-ai-reading
Content-Type: application/json; charset=utf-8
X-Workflow-Token: <在插件设置中填写的 Token>
```

请求正文结构：

```json
{
  "requestId": "ITEM_KEY-时间戳",
  "item": {
    "itemKey": "Zotero 条目 Key",
    "libraryID": 1,
    "title": "论文标题",
    "authors": ["作者"],
    "year": "2026",
    "date": "2026-01-01",
    "doi": "10.xxxx/example",
    "url": "https://example.org",
    "publicationTitle": "期刊名称",
    "abstract": "摘要",
    "tags": ["标签"]
  },
  "content": {
    "source": "zotero_fulltext_cache",
    "text": "全文或摘要文本",
    "charCount": 12345
  },
  "options": {
    "template": "academic_reading_v1",
    "language": "zh-CN",
    "subfolder": "Literature Notes"
  }
}
```

成功响应必须是 HTTP 2xx、合法 JSON，并至少包含：

```json
{
  "success": true
}
```

推荐响应：

```json
{
  "success": true,
  "requestId": "原请求 ID",
  "itemKey": "原条目 Key",
  "relativePath": "Literature Notes/example.md",
  "filename": "example.md",
  "message": "处理完成"
}
```

## 常见问题

### The requested webhook "POST zotero-ai-reading" is not registered

请求已经到达 n8n，但 n8n 中没有注册对应的“HTTP 方法 + 路径”。检查：

- 工作流已经 Published/Active。
- Webhook 节点的 HTTP Method 是 `POST`。
- Path 是 `zotero-ai-reading`。
- 插件使用生产地址 `/webhook/zotero-ai-reading`。
- 如果使用 `/webhook-test/`，必须先在 n8n 中点击“Listen for test event”，且测试监听只会临时生效。

### 论文全文和摘要均不可用

- 确认所选对象是父级普通文献条目。
- 确认条目具有 PDF 附件，或填写了摘要。
- 在设置中启用“无法读取全文时使用摘要”。

### n8n 返回了无效的响应

确认工作流最终返回 JSON，并包含布尔值 `"success": true`。

## 本地开发与构建

要求：

- Node.js LTS
- npm
- Zotero 9

安装依赖并构建：

```powershell
Set-Location 'E:\26cyf\zotero-plugin\zotero-ai-reading'
npm ci
npm run lint:check
npm run build
```

产物：

```text
.scaffold/build/zotero-ai-reading.xpi
.scaffold/build/update.json
```

## 首次上传到 GitHub

目标仓库：

```text
https://github.com/luelue-dot/Zotero-AI-Notes
```

### 1. 安装并登录 GitHub CLI

```powershell
winget install --id GitHub.cli -e
```

安装后重新打开 PowerShell：

```powershell
gh --version
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh auth status
```

### 2. 设置本仓库的 GitHub 提交身份

```powershell
Set-Location 'E:\26cyf\zotero-plugin\zotero-ai-reading'

$GitHubLogin = gh api user --jq '.login'
$GitHubId = gh api user --jq '.id'

git config user.name $GitHubLogin
git config user.email "$GitHubId+$GitHubLogin@users.noreply.github.com"
```

### 3. 验证并提交源码

```powershell
npm run lint:check
npm run build

git status --short
git add -A
git status --short
git commit -m "Release Zotero AI Notes 3.1.8"
```

`.env`、`.scaffold`、`node_modules` 和本地构建产物不会进入提交。

### 4. 将模板远程保留为 upstream

本地仓库最初来自 Zotero Plugin Template，因此把原远程改名为 `upstream`，再添加自己的仓库：

```powershell
git remote rename origin upstream
git remote add origin 'https://github.com/luelue-dot/Zotero-AI-Notes.git'
git remote -v
```

首次推送：

```powershell
git push -u origin main
```

## 发布 3.1.8 XPI

### 推荐：使用仓库内置 GitHub Actions

`.github/workflows/release.yml` 会在推送 `v*` 标签时执行构建和 Release。

```powershell
git tag -a v3.1.8 -m "Release Zotero AI Notes 3.1.8"
git push origin v3.1.8
```

查看并等待 Release 工作流：

```powershell
gh run list `
  --repo luelue-dot/Zotero-AI-Notes `
  --workflow Release `
  --limit 5

$RunId = gh run list `
  --repo luelue-dot/Zotero-AI-Notes `
  --workflow Release `
  --limit 1 `
  --json databaseId `
  --jq '.[0].databaseId'

gh run watch $RunId `
  --repo luelue-dot/Zotero-AI-Notes `
  --exit-status
```

验证版本 Release：

```powershell
gh release view v3.1.8 `
  --repo luelue-dot/Zotero-AI-Notes `
  --web
```

### GitHub Actions 失败时的手动发布

先确认本地产物为 3.1.8：

```powershell
npm run build

Get-FileHash `
  -Algorithm SHA256 `
  -LiteralPath '.\.scaffold\build\zotero-ai-reading.xpi'
```

创建版本 Release 并上传 XPI：

```powershell
gh release create v3.1.8 `
  '.\.scaffold\build\zotero-ai-reading.xpi' `
  --repo 'luelue-dot/Zotero-AI-Notes' `
  --title 'Zotero AI Notes 3.1.8' `
  --notes 'Zotero 9 compatibility, stable context menu integration, native Zotero HTTP transport, and staged error diagnostics.'
```

插件清单中的自动更新地址指向稳定通道：

```text
https://github.com/luelue-dot/Zotero-AI-Notes/releases/download/release/update.json
```

首次创建稳定更新通道：

```powershell
gh release create release `
  '.\.scaffold\build\update.json' `
  --repo 'luelue-dot/Zotero-AI-Notes' `
  --title 'Zotero AI Notes stable update channel' `
  --notes 'Stable update metadata for Zotero.'
```

以后更新稳定通道：

```powershell
gh release upload release `
  '.\.scaffold\build\update.json' `
  --repo 'luelue-dot/Zotero-AI-Notes' `
  --clobber
```

最终验证：

```powershell
gh release view v3.1.8 `
  --repo luelue-dot/Zotero-AI-Notes `
  --json url,tagName,assets

gh release view release `
  --repo luelue-dot/Zotero-AI-Notes `
  --json url,tagName,assets
```

预期下载地址：

```text
https://github.com/luelue-dot/Zotero-AI-Notes/releases/download/v3.1.8/zotero-ai-reading.xpi
https://github.com/luelue-dot/Zotero-AI-Notes/releases/download/release/update.json
```

## 隐私与边界

- 插件不会把 Webhook Token 写入构建产物或错误日志。
- 插件不会上传原始 PDF 文件，只发送 Zotero 全文缓存中的文本或摘要。
- 为读取全文，插件可能请求 Zotero 为所选 PDF 建立本地全文索引。
- 插件不会直接修改 n8n、Docker 或 Obsidian。
- 插件不会创建、修改或删除 Zotero 文献条目、附件、笔记和标签。

## 作者与许可

- Author: [luelue-dot](https://github.com/luelue-dot)
- Homepage: [luelue-dot/Zotero-AI-Notes](https://github.com/luelue-dot/Zotero-AI-Notes)
- License: [AGPL-3.0-or-later](LICENSE)
