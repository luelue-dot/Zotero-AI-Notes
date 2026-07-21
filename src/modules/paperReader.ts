import type { PaperMetadata } from "../types/contracts";

export function readPaperMetadata(item: Zotero.Item): PaperMetadata {
  const date = item.getField("date").trim();
  return {
    itemKey: item.key,
    libraryID: item.libraryID,
    title: item.getField("title").trim(),
    authors: item
      .getCreators()
      .map((creator) =>
        creator.fieldMode === 1
          ? creator.lastName.trim()
          : `${creator.firstName} ${creator.lastName}`.trim(),
      )
      .filter(Boolean),
    year: date.match(/\b\d{4}\b/)?.[0] ?? "",
    date,
    doi: item.getField("DOI").trim(),
    url: item.getField("url").trim(),
    publicationTitle: item.getField("publicationTitle").trim(),
    abstract: item.getField("abstractNote").trim(),
    tags: item
      .getTags()
      .map(({ tag }) => tag.trim())
      .filter(Boolean),
  };
}
