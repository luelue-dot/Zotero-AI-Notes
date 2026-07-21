import { config } from "../../package.json";
import { N8nClient } from "./n8nClient";
import { createProgressNotifier, showNotification } from "./notifier";
import { buildPayload, createRequestId } from "./payloadBuilder";
import { getPluginSettings } from "./preferences";
import { ContentUnavailableError, readPaperContent } from "./fulltextReader";
import { readPaperMetadata } from "./paperReader";

const activeItemKeys = new Set<string>();
const ITEM_MENU_ID = `${config.addonRef}-ai-notes2obsidian`;
const ITEM_MENU_LABEL = "AI-notes2obsidian";
const menuObservers = new WeakMap<Window, MutationObserver>();

type ProcessingStage =
  | "settings"
  | "metadata"
  | "fulltext"
  | "payload"
  | "transport"
  | "unexpected";

class ProcessingStageError extends Error {
  constructor(
    public readonly stage: ProcessingStage,
    public readonly userMessage: string,
  ) {
    super(userMessage);
    this.name = "ProcessingStageError";
  }
}

export type ItemSelection =
  | { valid: true; item: Zotero.Item }
  | { valid: false; message: string };

export function registerItemMenu(win: _ZoteroTypes.MainWindow): void {
  if (ensureItemMenu(win) || menuObservers.has(win)) {
    return;
  }

  // A future main window can reach the hook before its popupset is attached.
  // Observe only until the persistent item menu exists; never mutate the menu
  // from popupshowing/popuphidden handlers.
  const observer = new win.MutationObserver(() => {
    if (ensureItemMenu(win)) {
      observer.disconnect();
      menuObservers.delete(win);
    }
  });
  observer.observe(win.document.documentElement, {
    childList: true,
    subtree: true,
  });
  menuObservers.set(win, observer);
}

export function unregisterItemMenu(win: Window): void {
  const observer = menuObservers.get(win);
  if (observer) {
    observer.disconnect();
    menuObservers.delete(win);
  }
  win.document.getElementById(ITEM_MENU_ID)?.remove();
}

function ensureItemMenu(win: _ZoteroTypes.MainWindow): boolean {
  const document = win.document;
  if (document.getElementById(ITEM_MENU_ID)) {
    return true;
  }

  const itemMenu = document.getElementById("zotero-itemmenu");
  if (!itemMenu) {
    return false;
  }

  const menuItem = document.createXULElement("menuitem");
  menuItem.id = ITEM_MENU_ID;
  menuItem.setAttribute("label", ITEM_MENU_LABEL);
  menuItem.addEventListener("command", () => {
    void handleSelectedItems(win.ZoteroPane.getSelectedItems());
  });

  // Zotero 9 updates its fixed native entries by child index and appends its
  // dynamic MenuManager entries afterwards. Keeping this node at the end
  // preserves all native indices and avoids MenuManager's hidden-menu grouping.
  itemMenu.appendChild(menuItem);
  return true;
}

export function validateSelection(items: Zotero.Item[]): ItemSelection {
  if (items.length === 0) {
    return { valid: false, message: "请选择一篇文献。" };
  }
  if (items.length > 1) {
    return { valid: false, message: "第一版仅支持选择一篇文献。" };
  }
  if (!items[0].isRegularItem()) {
    return { valid: false, message: "请选择其父级普通文献条目。" };
  }
  return { valid: true, item: items[0] };
}

export async function withItemLock<T>(
  item: Zotero.Item,
  task: () => Promise<T>,
): Promise<T | undefined> {
  if (activeItemKeys.has(item.key)) {
    showNotification("该文献正在处理中，请勿重复提交。", "fail");
    return undefined;
  }

  activeItemKeys.add(item.key);
  try {
    return await task();
  } finally {
    activeItemKeys.delete(item.key);
  }
}

async function handleSelectedItems(items: Zotero.Item[]): Promise<void> {
  const selection = validateSelection(items);
  if (!selection.valid) {
    showNotification(selection.message, "fail");
    return;
  }

  await withItemLock(selection.item, async () => {
    const progress = createProgressNotifier("正在读取论文信息");
    try {
      const settings = await runProcessingStage(
        "settings",
        "读取插件设置失败，请查看 Zotero 错误控制台。",
        getPluginSettings,
      );
      const metadata = await runProcessingStage(
        "metadata",
        "读取文献元数据失败，请查看 Zotero 错误控制台。",
        () => readPaperMetadata(selection.item),
      );
      progress.update("正在读取PDF全文", 35);
      const content = await runProcessingStage(
        "fulltext",
        "读取PDF全文失败，请查看 Zotero 错误控制台。",
        () =>
          readPaperContent(
            selection.item,
            metadata.abstract,
            settings.useAbstractFallback,
          ),
        (error) => error instanceof ContentUnavailableError,
      );
      if (content.source === "abstract") {
        progress.update("正在使用摘要", 55);
      }
      const payload = await runProcessingStage(
        "payload",
        "构造请求数据失败，请查看 Zotero 错误控制台。",
        () =>
          buildPayload(
            createRequestId(metadata.itemKey),
            metadata,
            content,
            settings,
          ),
      );
      progress.update("已发送至n8n，正在等待处理", 75);
      const result = await runProcessingStage(
        "transport",
        "调用 n8n 失败，请查看 Zotero 错误控制台。",
        () => new N8nClient().send(payload, settings),
      );
      if (!result.ok) {
        progress.fail(result.message);
        return;
      }
      const destination =
        result.response.relativePath ??
        result.response.filename ??
        result.response.message ??
        "n8n 已完成处理。";
      progress.succeed(`笔记已生成：${destination}`);
    } catch (error) {
      if (
        !(error instanceof ContentUnavailableError) &&
        !(error instanceof ProcessingStageError)
      ) {
        logProcessingError("unexpected", error);
      }
      progress.fail(
        error instanceof ContentUnavailableError
          ? error.message
          : error instanceof ProcessingStageError
            ? error.userMessage
            : "处理失败，请检查文献和插件设置。",
      );
    }
  });
}

async function runProcessingStage<T>(
  stage: ProcessingStage,
  userMessage: string,
  task: () => T | Promise<T>,
  preserveError?: (error: unknown) => boolean,
): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (preserveError?.(error)) {
      throw error;
    }
    logProcessingError(stage, error);
    throw new ProcessingStageError(stage, userMessage);
  }
}

function logProcessingError(stage: ProcessingStage, error: unknown): void {
  const detail = getSafeErrorDetail(error);
  Zotero.logError(
    new Error(`[${config.addonName}] ${stage} failed: ${detail}`),
  );
}

function getSafeErrorDetail(error: unknown): string {
  const name =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string" &&
    error.name
      ? error.name
      : typeof error;
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : String(error);
  const sanitized = message
    .replace(/https?:\/\/[^\s"'<>]+/gi, "[URL]")
    .replace(
      /(authorization|x-workflow-token|webhooktoken)(\s*[:=]\s*)\S+/gi,
      "$1$2[redacted]",
    )
    .replace(
      /("(?:text|abstract|webhookToken)"\s*:\s*")[^"]*/gi,
      "$1[redacted]",
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
  return `${name}: ${sanitized || "no message"}`;
}
