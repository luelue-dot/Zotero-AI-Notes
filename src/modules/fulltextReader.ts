import type { PaperContent } from "../types/contracts";

export class ContentUnavailableError extends Error {
  constructor() {
    super("论文全文和摘要均不可用。");
  }
}

export async function readPaperContent(
  item: Zotero.Item,
  abstract: string,
  useAbstractFallback: boolean,
): Promise<PaperContent> {
  const fulltext = await readFulltext(item);
  if (fulltext) {
    return toContent("zotero_fulltext_cache", fulltext);
  }
  if (useAbstractFallback && abstract.trim()) {
    return toContent("abstract", cleanText(abstract));
  }
  throw new ContentUnavailableError();
}

async function readFulltext(item: Zotero.Item): Promise<string> {
  try {
    const attachment = await item.getBestAttachment();
    if (!attachment || !attachment.isPDFAttachment()) return "";

    if (!(await Zotero.Fulltext.isFullyIndexed(attachment))) {
      await Zotero.Fulltext.indexItems([attachment.id], { complete: true });
    }
    if (!(await Zotero.Fulltext.isFullyIndexed(attachment))) return "";

    const contents = await Zotero.File.getContentsAsync(
      Zotero.Fulltext.getItemCacheFile(attachment),
      "utf-8",
    );
    return typeof contents === "string" ? cleanText(contents) : "";
  } catch {
    return "";
  }
}

function toContent(source: PaperContent["source"], text: string): PaperContent {
  return { source, text, charCount: text.length };
}

export function cleanText(text: string): string {
  return text
    .replace(/\0/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{5,}/g, "\n\n\n\n")
    .trim();
}
