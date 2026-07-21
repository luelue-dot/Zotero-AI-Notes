# Zotero AI Reading 插件：Trade-off 与进度账本

## 使用规则

本文件是项目唯一的阶段状态、决策与验证记录。每次开始阶段前标记为 `in_progress`，完成后记录实际证据再标记为 `completed`；人工操作必须保留为 `manual_pending`。不得记录 Token、API Key、完整论文正文或其他秘密。

允许状态：`pending | in_progress | completed | manual_pending | blocked | not_available`

## 固定范围

- [x] 不修改 n8n 工作流、Docker、Compose、容器、端口、Volume 或环境变量。
- [x] 不写入 Obsidian 或任何 Vault 路径。
- [x] 不创建、更新或删除 Zotero 条目、笔记、标签、附件和数据库内容。
- [x] 不读取或修改 Zotero SQLite 数据库。
- [x] 不发布、推送、创建 PR 或 Git commit。
- [x] 不自动重试 Webhook 请求。

## 阶段进度

| ID  | 阶段                 | 状态           | 开始时间                   | 完成时间                   | 结果摘要                                                                 |
| --- | -------------------- | -------------- | -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| P0  | 仓库与环境预检       | completed      | 2026-07-20 15:24:31 +08:00 | 2026-07-20 15:26:20 +08:00 | 使用现有 Zotero Plugin Template 3.1.0（Zotero 7 目标）实施；无需初始化。 |
| P1  | 契约与偏好定义       | completed      | 2026-07-20 15:26:20 +08:00 | 2026-07-20 15:31:05 +08:00 | 已建立协议契约、七项首选项和原生设置页；Token 默认为空。                 |
| P2  | 菜单与选择校验       | completed      | 2026-07-20 15:31:05 +08:00 | 2026-07-20 15:35:15 +08:00 | 唯一右键菜单、选择校验和 finally 释放的条目锁已实现。                    |
| P3  | 元数据与全文读取     | completed      | 2026-07-20 15:35:15 +08:00 | 2026-07-20 15:37:56 +08:00 | 元数据、Zotero 全文缓存、摘要降级与无内容错误已实现。                    |
| P4  | Payload与HTTP接入    | completed      | 2026-07-20 15:37:56 +08:00 | 2026-07-20 15:39:47 +08:00 | 固定 payload、单次 POST、超时与响应分类已实现。                          |
| P5  | 进度、成功与失败体验 | completed      | 2026-07-20 15:39:47 +08:00 | 2026-07-20 15:41:19 +08:00 | 已串联进度、结果提示、错误分类与锁释放。                                 |
| P6  | 自动验证与XPI打包    | completed      | 2026-07-20 15:41:19 +08:00 | 2026-07-20 15:44:21 +08:00 | lint 与构建通过；已生成 40,189 字节 XPI。                                |
| P7  | 人工验收说明         | completed      | 2026-07-20 15:44:21 +08:00 | 2026-07-20 15:47:37 +08:00 | 已记录十项用例，全部保留为 manual_pending。                              |
| P8  | Zotero 9 兼容与打包  | completed      | 2026-07-20 16:15:43 +08:00 | 2026-07-20 16:18:37 +08:00 | 已迁移官方菜单 API、限定至 Zotero 9，并生成 3.1.1 XPI。                  |
| P9  | Zotero 9 菜单修复    | completed      | 2026-07-20 16:46:34 +08:00 | 2026-07-20 16:48:24 +08:00 | 已移除隐藏条件并生成 3.1.2 XPI，待用户手动确认。                         |
| P10 | Zotero 9 菜单与发布  | blocked        | 2026-07-20 17:24:34 +08:00 | 2026-07-20 17:53:29 +08:00 | 3.1.4 已构建；GitHub 连接器写权限与 Git 网络均被阻止。                   |
| P11 | Zotero 9 启动链修复  | completed      | 2026-07-20 18:07:25 +08:00 | 2026-07-20 18:16:54 +08:00 | 仅通过包内检查；后续用户实机确认 3.1.5 运行失败。                        |
| P12 | Zotero 9 运行时复盘  | manual_pending | 2026-07-20 18:57:35 +08:00 | 2026-07-20 19:24:00 +08:00 | 已修正沙箱入口并生成 3.1.6；真实 Zotero 9 UI 结果等待用户确认。          |

## 当前检查点

```text
当前阶段：P12 Zotero 9 运行时复盘（manual_pending）
下一动作：用户覆盖安装 3.1.6 并重启 Zotero 9，确认设置页与右键项；如仍失败，读取 startupErrors。
允许修改：无。
阻塞项：未获授权的测试 Profile 不得启动；Webhook 单次测试返回 HTTP 404。
```

## 阶段记录

### P0：仓库与环境预检

- 状态：`completed`
- 开始时间：2026-07-20 15:24:31 +08:00
- 完成时间：2026-07-20 15:26:20 +08:00
- 检查内容：
  - [x] 已读取 AGENTS.md 或确认不存在：仓库中不存在 AGENTS.md
  - [x] 已读取 README、package.json、插件清单和现有源码
  - [x] 已检查工作区状态：仅 `package-lock.json` 为既有修改，必须保留
  - [x] 已确认项目类型：现有 Zotero Plugin Template 3.1.0，源文件、Scaffold 配置与 manifest 齐全
  - [x] 已确认现有 Node/npm：Node v24.16.0、npm 11.13.0；package.json 未声明 engines，README 要求 Node 最新 LTS，当前版本满足要求
  - [x] 已确认不修改 n8n、Docker 和 Obsidian
- 修改文件：`tradeoff.md`（建立项目根目录账本并标记 P0 开始）
- 验证命令及结果：`git status --short --branch`、`node --version`、`npm --version` 已执行
- 证据摘要：README 标明 Zotero 7；manifest 目标版本为 6.999 至 8.\*；构建脚本为 `zotero-plugin build && tsc --noEmit`，产物在 `.scaffold/build/`。
- 阻塞项：无

### P1：契约与偏好定义

- 状态：`completed`
- 开始时间：2026-07-20 15:26:20 +08:00
- 完成时间：2026-07-20 15:31:05 +08:00
- 计划文件：`src/types/contracts.ts`、`src/modules/preferences.ts`、首选项资源与本地化。
- 实际修改文件：`package.json`、`addon/prefs.js`、`addon/content/preferences.xhtml`、`addon/locale/*/preferences.ftl`、`typings/prefs.d.ts`、`src/types/contracts.ts`、`src/modules/preferences.ts`、`src/modules/preferenceScript.ts`、`src/addon.ts`。
- 验证命令及结果：`npm run build` 通过（包含 `tsc --noEmit`），生成模板 XPI；首次受限环境运行仅被更新检查缓存权限阻止，获准后原命令成功。
- 证据摘要：Token 默认空，设置仅包含 URL、Token、超时、摘要降级、模板、语言、子目录；未增加网络依赖或请求。
- 偏差或阻塞：

### P2：菜单与选择校验

- 状态：`completed`
- 开始时间：2026-07-20 15:31:05 +08:00
- 完成时间：2026-07-20 15:35:15 +08:00
- 计划文件：`src/modules/menu.ts`、启动/通知模块。
- 实际修改文件：`src/hooks.ts`、`src/modules/menu.ts`、`src/modules/notifier.ts`、`src/modules/preferencesPane.ts`、本地化资源。
- 验证命令及结果：`npm run build` 通过（包含 `tsc --noEmit`）。
- 证据摘要：零/多选和非普通条目均不会发起网络请求；每个条目使用 `Set` 锁并在 `finally` 释放。
- 偏差或阻塞：

### P3：元数据与全文读取

- 状态：`completed`
- 开始时间：2026-07-20 15:35:15 +08:00
- 完成时间：2026-07-20 15:37:56 +08:00
- 计划文件：`src/modules/paperReader.ts`、`src/modules/fulltextReader.ts`。
- 实际修改文件：同计划文件。
- 全文API核对结果：本地 `zotero-types` 定义确认 `getBestAttachment(): Promise<Item | false>`、`Zotero.Fulltext.isFullyIndexed(item)`、`indexItems(number[], {complete})`、`getItemCacheFile(item)` 与 `Zotero.File.getContentsAsync(file, "utf-8")`；按此实现。
- 摘要降级验证：代码只在全文为空/失败且设置允许、摘要非空时使用 `abstract`；两者均无内容时抛出受控错误。
- 日志隐私检查：该阶段不输出正文；内容对象仅在内存中传递。
- 验证命令及结果：`npm run build` 通过（包含 `tsc --noEmit`）。
- 证据摘要：只读取 Zotero API 提供的全文缓存，不读 SQLite、不读 PDF 二进制、不添加解析库。
- 偏差或阻塞：

### P4：Payload与HTTP接入

- 状态：`completed`
- 开始时间：2026-07-20 15:37:56 +08:00
- 完成时间：2026-07-20 15:39:47 +08:00
- 计划文件：`src/modules/payloadBuilder.ts`、`src/modules/n8nClient.ts`、`src/types/contracts.ts`。
- 实际修改文件：同计划文件。
- 请求协议核对：POST、JSON Content-Type、X-Workflow-Token、固定 item/content/options 字段均由单一客户端/构造器生成。
- 响应协议核对：仅 HTTP 2xx、可解析 JSON、`success === true` 进入成功路径；其余分类为 HTTP/响应错误。
- Token日志检查：客户端从不记录请求头、Token 或正文；非 JSON 内容也不记录。
- 重试行为检查：每次调用仅执行一次 `fetch`，没有循环或重试分支。
- 验证命令及结果：`npm run build` 通过（包含 `tsc --noEmit`）。
- 证据摘要：无 n8n 请求在构建期间发生；未修改 n8n。
- 偏差或阻塞：

### P5：进度、成功与失败体验

- 状态：`completed`
- 开始时间：2026-07-20 15:39:47 +08:00
- 完成时间：2026-07-20 15:41:19 +08:00
- 计划文件：菜单执行与通知模块。
- 实际修改文件：`src/modules/menu.ts`、`src/modules/notifier.ts`。
- 并发锁释放检查：`withItemLock()` 以 `finally` 删除 item key；读取、配置、HTTP 和未知异常均经过该路径。
- 错误分类检查：配置、无内容、超时、网络、HTTP/n8n 响应均输出非敏感的简短文案。
- 验证命令及结果：`npm run build` 通过（包含 `tsc --noEmit`）。
- 证据摘要：进度覆盖读取信息、读取 PDF/使用摘要、已发送等待、成功与失败；不打开文件或 Obsidian。
- 偏差或阻塞：

### P6：自动验证与XPI打包

- 状态：`completed`
- 开始时间：2026-07-20 15:41:19 +08:00
- 完成时间：2026-07-20 15:44:21 +08:00
- 执行命令：
  - lint：`npm run lint` 为 `not_available`（package.json 无该脚本）；`npm run lint:check` 通过。
  - typecheck/build：`npm run build` 通过（`zotero-plugin build && tsc --noEmit`）。
  - test：`manual_pending`；`npm test` 存在，但仓库无 `.env` 且用户未明确提供测试 Zotero Profile，按范围约束不启动。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`
- 未执行命令及原因：`npm test` 需要明确的测试 Profile；不得使用或影响正式 Zotero Profile。
- 发现的无关历史问题：无；`package-lock.json` 是 P0 已记录的用户既有修改，未覆盖。
- 证据摘要：最终 XPI 存在，长度 40,189 字节，生成时间 2026-07-20 15:43:56 +08:00。

### P7：人工验收说明

- 状态：`completed`
- 开始时间：2026-07-20 15:44:21 +08:00
- 完成时间：2026-07-20 15:47:37 +08:00
- 文本型PDF：`manual_pending`
- 仅摘要：`manual_pending`
- 扫描PDF降级：`manual_pending`
- 无可分析内容：`manual_pending`
- 多选：`manual_pending`
- Token为空/错误：`manual_pending`
- n8n不可达：`manual_pending`
- n8n业务错误：`manual_pending`
- 重复点击：`manual_pending`
- 成功写入磁盘并返回路径：`manual_pending`
- 人工验收说明文件：`doc/manual-acceptance.md`
- 偏差或阻塞：所有十项均需用户提供明确测试 Profile 与测试 Webhook，保留为 `manual_pending`。

### P8：Zotero 9 兼容与打包

- 状态：`completed`
- 开始时间：2026-07-20 16:15:43 +08:00
- 完成时间：2026-07-20 16:18:37 +08:00
- 计划文件：`addon/manifest.json`、`package.json`。
- 实际修改文件：`addon/manifest.json`、`package.json`、`package-lock.json`、`src/hooks.ts`、`src/modules/menu.ts`、`addon/locale/*/mainWindow.ftl`。
- 兼容性依据：官方 Zotero 说明要求 `strict_max_version` 设为已测试的最新版本；Zotero 9 已正式发布。当前插件仅使用条目、全文缓存、偏好和菜单 API，未发现需要为 Zotero 9 替换的已移除 API。
- 验证命令及结果：`npm run lint:check` 通过；`npm run build` 通过（包含 `tsc --noEmit`）；`git diff --check` 通过。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`（40,315 字节，版本 3.1.1）。
- 偏差或阻塞：未提供明确测试 Profile，真实 Zotero 9 运行验收保留为 `manual_pending`。

### P9：Zotero 9 菜单修复

- 状态：`completed`
- 开始时间：2026-07-20 16:46:34 +08:00
- 完成时间：2026-07-20 16:48:24 +08:00
- 计划文件：`src/modules/menu.ts`、`package.json`。
- 实际修改文件：`src/modules/menu.ts`、`package.json`、`package-lock.json`。
- 问题：用户已在 Zotero 9 成功加载 3.1.1，但右键条目时菜单不显示。
- 原因判断：`onShowing` 在菜单上下文尚未提供 `items` 时将菜单设为不可见；选择合法性已在 `onCommand` 路径校验，因此该显示期条件多余。
- 验证命令及结果：`npm run lint:check` 通过；`npm run build` 通过（包含 `tsc --noEmit`）；`git diff --check` 通过；XPI 内清单已确认版本 3.1.2 且兼容范围为 9.0–9.\*。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`（40,282 字节，版本 3.1.2）。
- 偏差或阻塞：需用户在 Zotero 9 测试 Profile 手动确认菜单显示，保留为 `manual_pending`。

### P10：Zotero 9 菜单与发布

- 状态：`blocked`
- 开始时间：2026-07-20 17:24:34 +08:00
- 完成时间：2026-07-20 17:53:29 +08:00
- 计划文件：`src/hooks.ts`、`package.json`、`package-lock.json`、`tradeoff.md`。
- 实际修改文件：`src/hooks.ts`、`src/modules/menu.ts`、`package.json`、`package-lock.json`、`tradeoff.md`。
- 问题：3.1.2 启用时会妨碍 Zotero 9 原生条目右键菜单显示；同时用户授权创建同名 GitHub 仓库并上传。
- 原因判断：前两版的全局菜单注册仍会影响 Zotero 9 原生菜单。3.1.4 改为在每个主窗口加载后向既有菜单追加单个 XUL `menuitem`，并在窗口卸载/插件关闭时移除；不再调用 `Zotero.MenuManager`。
- GitHub 目标：`luelue-dot/Zotero-AI-Notes`；作者为 `luelue-dot`；主页为目标仓库 URL。
- 验证命令及结果：`npm run lint:check` 通过；`npm run build` 通过（包含 `tsc --noEmit`）；`git diff --check` 通过；XPI manifest 已确认作者 `luelue-dot`、主页、版本 3.1.4 与 Zotero 9 范围。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`（40,380 字节，版本 3.1.4）。
- 偏差或阻塞：GitHub 连接器读取目标仓库成功，但创建首个文件返回 `403 Resource not accessible by integration`；本机 Git HTTPS 访问也被网络重置。未执行提交、推送或上传。

### P11：Zotero 9 启动链修复

- 状态：`completed`
- 开始时间：2026-07-20 18:07:25 +08:00
- 完成时间：2026-07-20 18:16:54 +08:00
- 计划文件：`src/index.ts`、`src/addon.ts`、`src/hooks.ts`、`src/modules/menu.ts`、`src/modules/preferencesPane.ts`、`src/modules/notifier.ts`、`addon/content/preferences.xhtml`、`package.json`、`package-lock.json`、`tradeoff.md`。
- 实际修改文件：同计划文件。
- 用户报告：3.1.4 启用后设置页和插件右键项同时缺失。
- 原因判断：入口与 `Addon` 构造函数在生命周期钩子前同步实例化旧 Toolkit，异常会使偏好页和菜单均无法注册；菜单注册还只在窗口加载时查找一次 `zotero-itemmenu`，节点未就绪时不会重试。
- 实施边界：只调整插件自身的 Zotero 9 启动、设置、菜单和通知适配；不修改 n8n、Docker、Obsidian 或 Zotero 数据。
- 实施结果：入口、生命周期和通知均已移除旧 Toolkit 运行时依赖；偏好页注册会等待完成，七项设置使用原生偏好绑定；条目菜单会在窗口加载时尝试注入，并在 `popupshowing` 时补注册；设置页标题和右键项均使用 `AI-notes2obsidian`。
- 验证命令及结果：`npx tsc --noEmit`、`npm run lint:check`、`npm run build`、`git diff --check` 均通过；XPI 内容检查确认版本、Zotero 9 范围、七项设置、菜单标签、偏好页注册和延迟菜单监听均存在，最终脚本不含 Toolkit 运行时代码。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`（11,445 字节，SHA-256 `D5BDD63C4636E88CEAACC372D553E62679F9AA738FA669F5AB8CC60675B950DA`）。
- 人工验证：设置页显示、右键菜单显示及实际点击执行均为 `manual_pending`；未运行 `npm test`，因为需要启动真实 Zotero 测试 Profile，不得影响用户 Zotero 数据。
- 后续实机结果：用户覆盖安装并重启后，设置页与菜单仍均缺失；因此 P11 的“已修复”表述无效，只保留其构建活动记录。

### P12：Zotero 9 运行时复盘

- 状态：`manual_pending`
- 开始时间：2026-07-20 18:57:35 +08:00
- 自动阶段完成时间：2026-07-20 19:24:00 +08:00
- 用户实机结果：覆盖安装 3.1.5 并重启 Zotero 后，设置页与右键菜单项仍均未出现。
- 结论修正：P11 只证明构建产物包含预期代码，不能证明 Zotero 9 已成功执行插件生命周期；此前对外表述“已修复”不准确。
- 计划：从 `bootstrap.js -> src/index.ts -> hooks.onStartup()` 逐层检查真实运行时兼容性；以 Zotero 9 官方接口和本机安装版本为依据；验证 Webhook 时使用用户临时授权的凭据但不记录 Token。
- 实施边界：不修改 n8n、Docker、Obsidian 或 Zotero 数据；不自动安装到正式 Profile；不读取 Zotero SQLite。
- 安装状态证据：只读检查正式 Profile 的 `extensions.json` 与 XPI 哈希，确认安装的是版本 3.1.5、`active=true`、未被用户或应用禁用，且哈希与交付包完全一致；未读取 Zotero SQLite。
- 配置状态证据：正式 Profile 已存在 Webhook URL 与 Token 偏好项，因此设置数据未丢失；本账本不记录 Token。
- 根因：3.1.5 把主脚本加载到只含 `rootURI` 的独立普通对象，又删除了模板原有的全局桥接。主脚本依赖 `Zotero`、`addon`、`fetch` 和计时器，可能在 UI 注册前中断。Node 沙箱回归可稳定复现 `ReferenceError: addon is not defined`。
- 实际修改文件：`addon/bootstrap.js`、`src/index.ts`、`src/addon.ts`、`src/hooks.ts`、`src/modules/preferencesPane.ts`、`src/modules/menu.ts`、`src/modules/notifier.ts`、`addon/locale/*/mainWindow.ftl`、`zotero-plugin.config.ts`、`package.json`、`package-lock.json`、`tradeoff.md`。
- 实施结果：
  - 主脚本直接加载到 Zotero 实际插件沙箱，不再使用脱离全局量的 `ctx`。
  - 偏好页使用插件相对 URI，并保留七项完整 Preferences 绑定。
  - 菜单使用 Zotero 9 官方 `Zotero.MenuManager` 和 `main/library/item` 目标，不再依赖内部 DOM ID。
  - 设置与菜单独立注册；单项失败写入非敏感 `startupErrors`，不阻断另一项。
  - 构建目标从 Firefox 115 调整为 Zotero 9 实际使用的 Firefox 140。
- 自动验证：`npx tsc --noEmit`、`npm run lint:check`、`npm run build`、`git diff --check` 均通过；正常沙箱冒烟测试确认设置与菜单各注册一次且无启动错误；合成偏好失败测试确认菜单仍可注册。
- XPI 核验：版本 3.1.6，Zotero 9.0–9.\*；七项设置、官方菜单目标、`AI-notes2obsidian` 标签和启动错误隔离均存在；无直接 DOM 菜单注入、无真实 Token。
- `.xpi` 实际路径：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`（11,261 字节，SHA-256 `0C1B62BCB9A305A26F2CFEA609B6D1E8167CCC3CE6A21A75B3E249DBFB4B44CD`）。
- Webhook 验证：仅发送一次合成摘要 payload，无重试；`http://localhost:5678/webhook/zotero-ai-reading` 可连接但返回 HTTP 404，未达到插件要求的 2xx/`success=true`。
- 待人工确认：3.1.6 在真实 Zotero 9 中的设置页、右键菜单和点击执行均为 `manual_pending`，不得表述为已修复。

## 决策记录

仅在存在真实取舍时新增记录。

### D-001 插件身份替换模板占位符

- 日期：2026-07-20
- 所属阶段：P1
- 背景：模板的 add-on ID、首选项前缀和显示名称均为通用占位符。
- 选项A：保留模板身份；优点是改动少，缺点是与其他模板实例冲突且无法正确识别插件。
- 选项B：使用专属本地 add-on ID、引用名和偏好前缀；优点是安装与偏好隔离，缺点是现有模板偏好不会迁移。
- 选择：选项B。
- 原因：插件必须以独立身份可安装，且模板偏好不属于本任务功能。
- 可逆性：`容易`
- 影响文件：`package.json`、`zotero-plugin.config.ts` 的构建定义、首选项资源。

### D-002 Zotero 9 兼容范围

- 日期：2026-07-20
- 所属阶段：P8
- 背景：现有清单把插件最高兼容版本限制为 Zotero 8，阻止在 Zotero 9 安装。
- 选项A：只把最大版本放宽为 `9.*`；优点是最小变更，缺点是不能阻止旧主版本安装。
- 选项B：将范围限定为 `9.0–9.*` 并提升插件补丁版本；优点是与用户目标一致且可升级安装，缺点是放弃对旧 Zotero 的声明兼容。
- 选择：选项B。
- 原因：用户明确要求适配 Zotero 9；官方建议以实际测试的最新主版本设置上限，且新 XPI 应有更高版本号。
- 可逆性：`容易`
- 影响文件：`addon/manifest.json`、`package.json`。

### D-003 Zotero 9 沙箱与菜单注册

- 日期：2026-07-20
- 所属阶段：P12
- 背景：删除 Toolkit 后，主脚本仍加载到脱离 Zotero 插件全局量的普通对象；直接注入内部菜单 DOM 也不符合 Firefox 140/Zotero 9 官方接口。
- 选项A：恢复 Toolkit 全局桥接并保留 DOM 注入；优点是接近旧模板，缺点是重新引入已怀疑不兼容的运行时依赖，且继续依赖内部 DOM。
- 选项B：把脚本加载到 Zotero 实际插件沙箱，并使用相对资源 URI和官方 `MenuManager`；优点是与本机 Zotero 9.0.6 源码及官方开发说明一致，缺点是不再兼容依赖旧入口隔离方式的模板样例。
- 选择：选项B。
- 原因：本插件已不使用模板样例；真实插件沙箱已由 Zotero 注入所需全局量，官方 API 也会负责菜单生命周期和目标定位。
- 可逆性：`容易`
- 影响文件：`addon/bootstrap.js`、`src/index.ts`、`src/hooks.ts`、`src/modules/menu.ts`、`src/modules/preferencesPane.ts`、`zotero-plugin.config.ts`。

## 验证记录

| 日期时间                   | 阶段 | 命令或人工步骤                     | 结果   | 证据/备注                                                                   |
| -------------------------- | ---- | ---------------------------------- | ------ | --------------------------------------------------------------------------- |
| 2026-07-20 15:24:31 +08:00 | P0   | `git status --short --branch`      | 通过   | `main...origin/main`，用户既有修改仅 `package-lock.json`。                  |
| 2026-07-20 15:24:31 +08:00 | P0   | `node --version` / `npm --version` | 待核对 | Node v24.16.0；npm 11.13.0。                                                |
| 2026-07-20 15:30:49 +08:00 | P1   | `npm run build`                    | 通过   | `zotero-plugin build && tsc --noEmit` 均成功；`.scaffold/build` 已生成。    |
| 2026-07-20 15:35:15 +08:00 | P2   | `npm run build`                    | 通过   | 菜单、选择校验与锁的 TypeScript 检查通过。                                  |
| 2026-07-20 15:37:56 +08:00 | P3   | `npm run build`                    | 通过   | 元数据与全文读取的 TypeScript 检查通过。                                    |
| 2026-07-20 15:39:47 +08:00 | P4   | `npm run build`                    | 通过   | Payload 与 HTTP 客户端的 TypeScript 检查通过。                              |
| 2026-07-20 15:41:19 +08:00 | P5   | `npm run build`                    | 通过   | 完整执行链的 TypeScript 检查通过。                                          |
| 2026-07-20 15:43:56 +08:00 | P6   | `npm run lint:check`               | 通过   | Prettier 与 ESLint 均通过。                                                 |
| 2026-07-20 15:43:56 +08:00 | P6   | `npm run build`                    | 通过   | 已完成 TypeScript 检查并生成 XPI。                                          |
| 2026-07-20 15:47:37 +08:00 | P7   | `npm run lint:check`               | 通过   | 人工验收说明与账本格式检查通过。                                            |
| 2026-07-20 18:13:20 +08:00 | P11  | `npx tsc --noEmit` / lint          | 通过   | 类型检查、Prettier、ESLint 与 `git diff --check` 均通过。                   |
| 2026-07-20 18:16:14 +08:00 | P11  | `npm run build`                    | 通过   | 已生成版本 3.1.5 的最终 XPI。                                               |
| 2026-07-20 18:16:54 +08:00 | P11  | XPI 内容检查                       | 通过   | 七项设置、菜单补注册均存在，运行时脚本不含 Toolkit；界面为 manual_pending。 |
| 2026-07-20 18:57:35 +08:00 | P12  | 正式 Profile 扩展元数据与哈希      | 通过   | 3.1.5 已正确安装且启用；仅只读扩展元数据，未读 SQLite。                     |
| 2026-07-20 19:15:51 +08:00 | P12  | 单次合成 Webhook POST              | 失败   | localhost:5678 可达，但生产 Webhook 路径返回 HTTP 404；未重试。             |
| 2026-07-20 19:22:26 +08:00 | P12  | `npm run build`                    | 通过   | 已生成版本 3.1.6 的 XPI。                                                   |
| 2026-07-20 19:23:00 +08:00 | P12  | 启动沙箱与错误隔离冒烟测试         | 通过   | 正常路径两项均注册；偏好失败时菜单仍注册。                                  |
| 2026-07-20 19:24:00 +08:00 | P12  | XPI 内容、Token、格式与 lint 核验  | 通过   | XPI 无真实 Token；typecheck、lint、diff check 均通过。                      |

## 已知问题与阻塞

| ID      | 状态           | 问题                                                                                 | 影响                                                    | 恢复条件                                                                       | 所属阶段 |
| ------- | -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
|         |                |                                                                                      |                                                         |                                                                                |          |
| GH-001  | blocked        | 当前环境未安装 GitHub CLI，连接器不提供创建仓库能力。                                | 无法创建、提交或上传 `luelue-dot/zotero-ai-reading`。   | 安装 GitHub CLI 并完成 `gh auth login`。                                       | P10      |
| GH-002  | blocked        | GitHub 连接器对 `luelue-dot/Zotero-AI-Notes` 无写权限，且本机 Git HTTPS 连接被重置。 | 无法上传项目到已创建仓库。                              | 重新授权 GitHub 连接器对该仓库的 Contents 写权限，或提供可用的 `gh` 登录环境。 | P10      |
| Z9-001  | manual_pending | 3.1.5 在用户 Zotero 9 中未显示设置页和右键菜单；3.1.6 已修正入口。                   | 3.1.6 真实 UI 尚未确认。                                | 用户覆盖安装 3.1.6 并确认设置页和右键项；必要时读取 `startupErrors`。          | P12      |
| N8N-001 | blocked        | 授权的单次合成 POST 返回 HTTP 404。                                                  | 即使插件 UI 正常，当前生产 Webhook 也无法成功处理请求。 | 用户在 n8n 中确认工作流已激活且生产 URL 正确；本任务不修改 n8n。               | P12      |

## 最终交付核对

- [x] 所有自动阶段均为 `completed` 或有明确的 `blocked/not_available` 原因。
- [x] 人工项目没有被伪造为完成。
- [x] Webhook Token未进入源码、日志、测试夹具和构建产物。
- [x] 插件没有写入 Zotero、Obsidian或修改n8n。
- [x] 没有自动重试。
- [x] 已生成可安装 `.xpi`。
- [x] 已记录 `.xpi` 路径。
- [x] 已提供最短安装和配置步骤。
- [x] 没有执行发布、推送、commit、Docker或n8n修改。

## P13 最新状态（覆盖上方旧检查点）

- 状态：`completed`
- 开始时间：2026-07-20 19:48:47 +08:00
- 自动阶段完成时间：2026-07-20 19:58:57 +08:00
- 用户实机证据：3.1.6 的设置页已经显示，证明插件沙箱与 `startup()` 链路修复有效；条目右键项进入 Zotero 的“隐藏菜单”管理但实际不显示，调整顺序会影响其后的原生菜单，并且右键菜单在启动后只能打开一次。
- 当前判断：故障范围已经收敛到 `Zotero.MenuManager` 对自定义菜单的动态分组、隐藏和弹出生命周期处理；不能把 3.1.6 的菜单结果标记为已修复。
- 实施计划：停止注册 `main/library/item` 动态菜单；改为在每个已完成加载的 Zotero 主窗口中向现有 `#zotero-itemmenu` 注入一个持久、唯一且可清理的 `menuitem`。不监听 `popupshowing`，不在菜单打开期间增删或重排节点，不创建分隔符。
- 计划修改：`src/modules/menu.ts`、`src/hooks.ts`、`package.json`、`package-lock.json`、`tradeoff.md`。
- 实际修改：`src/modules/menu.ts` 改为每窗口持久菜单节点和有界延迟观察；`src/hooks.ts` 负责已有/新增窗口注册及卸载清理；版本提升为 3.1.7。
- 自动验证：`npx tsc --noEmit`、`npm run lint:check`、`git diff --check` 和 `npm run build` 均通过。构建沙箱首次因更新检查缓存无写权限失败，获准使用原命令后成功；没有修改项目范围外的数据。
- 生命周期冒烟测试：插件启动注册设置页一次、菜单节点一次；重复两次窗口加载仍只有一个入口；连续两轮 `popupshowing/popuphidden` 不增删节点且弹出菜单上没有插件监听器；目标节点延迟出现时仅观察到注入完成并立即断开；窗口卸载后入口清理。结果：`PASS`。
- XPI 核验：版本 3.1.7，作者 `luelue-dot`，主页为目标 GitHub 仓库，兼容范围 9.0–9.\*；包内脚本包含持久 `#zotero-itemmenu` 入口，未包含 `MenuManager.registerMenu`、`MenuManager.unregisterMenu` 或弹出生命周期监听。
- 构建产物：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`，11,412 字节，SHA-256 `C43CB0A6E996EBCEEA9C2C71F37E9EFA768A88F875B1E273AE2C420CE7A25742`。
- 人工验证：用户随后确认 3.1.7 中“菜单一切正常”，包括入口显示和重复打开；点击后的处理错误属于 P14 传输链，不再属于菜单故障。
- 固定边界：不修改 n8n、Docker、Obsidian 或 Zotero 数据；不读取 Zotero SQLite；不安装到正式 Profile；不重试 Webhook；不提交或推送 Git。

### Z9-002

- 状态：`completed`
- 问题：3.1.6 的 `MenuManager` 菜单被归入“隐藏菜单”，并干扰条目菜单后续显示。
- 影响：插件入口不可见，且可能破坏 Zotero 原生右键菜单的重复打开和布局。
- 自动阶段结果：已生成不再调用 `MenuManager`、不监听菜单弹出生命周期的 3.1.7 XPI。
- 恢复证据：用户确认 3.1.7 菜单一切正常；入口可见且右键菜单可重复打开。

## P14 Zotero 9 原生传输与安全错误诊断

- 状态：`manual_pending`
- 开始时间：2026-07-20 20:18:00 +08:00
- 自动阶段完成时间：2026-07-20 22:04:17 +08:00
- 用户实机证据：3.1.7 的设置页、条目右键菜单及重复打开均正常；点击入口后显示通用兜底错误“处理失败，请检查文献和插件设置”。
- 当前判断：菜单与生命周期问题已经由用户确认通过；当前故障位于点击后的读取或传输链。现有实现依赖插件 bootstrap 沙箱中的 `fetch`、`AbortController`、`DOMException` 和浏览器计时器，并且最终 `catch` 丢弃了真实异常，无法区分读取、组包和传输阶段。
- 实施计划：
  - 使用 Zotero 9 原生 `Zotero.HTTP.request()` 替换 `fetch` 和浏览器中止控制器。
  - 保持一次点击最多一次 HTTP POST，不增加自动重试。
  - 为设置、元数据、全文、payload、HTTP 和响应处理增加阶段化安全错误；只记录异常类型/消息，不记录 Token、请求头、正文或完整 payload。
  - 使用模拟 Zotero HTTP 响应验证成功、HTTP 错误、无效 JSON、超时和网络异常，不调用真实 Webhook。
  - 版本提升为 3.1.8，构建可安装 XPI。
- 计划修改：`src/modules/n8nClient.ts`、`src/modules/menu.ts`、必要的类型或测试文件、`package.json`、`package-lock.json`、`tradeoff.md`。
- 实际修改：
  - `src/modules/n8nClient.ts` 已使用 `Zotero.HTTP.request("POST", ...)`；不再依赖沙箱中的 `fetch`、`AbortController`、`DOMException` 或浏览器计时器。
  - 请求显式设置 `successCodes: false` 以便自行分类 HTTP 状态，`errorDelayMax: 0` 禁止 Zotero 的默认 5xx 重试，`logBodyLength: 0` 与 `debug: false` 禁止正文、Token 请求头和响应进入调试日志。
  - 200/`success=true`、非 2xx、无效 JSON、超时、网络异常及 status 0 均输出明确结果。
  - `src/modules/menu.ts` 为设置、元数据、全文、payload 和传输增加分阶段错误；Zotero 错误控制台只记录经 URL、Token 字段和正文键脱敏并截断的异常摘要。
  - 版本提升为 3.1.8。
- 自动验证：
  - `npx tsc --noEmit`、`npm run lint:check`、`git diff --check` 和 `npm run build` 均通过。
  - 最终 bundle 在未提供全局 `fetch`、`AbortController`、`DOMException` 的模拟 Zotero 沙箱中通过。
  - 模拟一次请求分别覆盖 200 成功、HTTP 404、200 无效 JSON、Zotero 超时异常、网络异常和 status 0；每次点击恰好调用一次原生 HTTP，请求选项确认无重试、无正文日志。
  - 元数据异常不会发送 HTTP；UI 显示元数据阶段错误，日志中的测试 URL 与 Token 类值均已脱敏。
- XPI 核验：版本 3.1.8，作者 `luelue-dot`，主页为目标 GitHub 仓库，兼容 Zotero 9.0–9.\*；包含 `Zotero.HTTP.request`，不含 `fetch`，未包含真实 Webhook Token。
- 构建产物：`E:\26cyf\zotero-plugin\zotero-ai-reading\.scaffold\build\zotero-ai-reading.xpi`，12,130 字节，SHA-256 `BC95911FC67F583146A81D9F4AF5DD546FE7BF66466BEF714AF8D63C627A2D93`。
- 人工验证：真实 Zotero 9 点击执行与真实 n8n 工作流仍为 `manual_pending`；此前授权的单次 Webhook 测试返回 HTTP 404，本阶段不重试也不修改 n8n。
- 固定边界：不修改 n8n、Docker、Obsidian 或 Zotero 条目/附件/笔记/数据库；不读取 Zotero SQLite；不安装到正式 Profile；不提交或推送 Git。

### Z9-003

- 状态：`manual_pending`
- 问题：3.1.7 点击菜单后显示无法定位阶段的通用处理错误。
- 自动阶段结果：3.1.8 已改用 Zotero 原生 HTTP，并提供安全的分阶段错误提示；模拟 Zotero 9 传输分支全部通过。
- 恢复条件：用户覆盖安装 3.1.8，在真实 Zotero 9 中点击确认能够显示明确结果；若进入 HTTP 404，需另行在 n8n 中激活或修正生产 Webhook，本任务未修改 n8n。

## P15 README 与本地 GitHub/Release 指南

- 状态：`completed`
- 开始时间：2026-07-20 22:30:00 +08:00
- 完成时间：2026-07-20 22:36:36 +08:00
- 用户要求：把模板 README 改为本插件说明，必须保留指定的 Zotero Plugin Template 徽章，并给出从本地上传源码以及发布 3.1.8 XPI 的可执行步骤。
- 实施计划：仅修改 `README.md` 与本账本；README 覆盖功能、Zotero 9 兼容、安装、插件设置、n8n Webhook 契约、构建、GitHub 首次推送、自动/手动 Release、校验与常见错误。
- 实际结果：`README.md` 已替换为 Zotero AI Notes 项目说明，保留用户指定的 Zotero Plugin Template 徽章原文；包含 3.1.8 安装与 SHA-256、设置项、数据契约、Webhook 未注册排查、首次 GitHub 推送、标签触发 Release、手动 XPI/update.json 发布及最终验证命令。
- 验证：`npm run lint:check` 与 `git diff --check` 通过；本地 3.1.8 XPI 仍为 12,130 字节，SHA-256 `BC95911FC67F583146A81D9F4AF5DD546FE7BF66466BEF714AF8D63C627A2D93`。
- 固定边界：不修改插件运行代码、n8n、Docker、Obsidian 或 Zotero 数据；不执行 Git 提交、推送或 Release；不记录真实 Token。
