export type ContentSource = "zotero_fulltext_cache" | "abstract";

export interface PluginSettings {
  webhookURL: string;
  webhookToken: string;
  requestTimeoutSeconds: number;
  useAbstractFallback: boolean;
  template: string;
  language: string;
  subfolder: string;
}

export interface PaperMetadata {
  itemKey: string;
  libraryID: number;
  title: string;
  authors: string[];
  year: string;
  date: string;
  doi: string;
  url: string;
  publicationTitle: string;
  abstract: string;
  tags: string[];
}

export interface PaperContent {
  source: ContentSource;
  text: string;
  charCount: number;
}

export interface N8nRequestPayload {
  requestId: string;
  item: PaperMetadata;
  content: PaperContent;
  options: {
    template: string;
    language: string;
    subfolder: string;
  };
}

export interface N8nSuccessResponse {
  success: true;
  requestId: string;
  itemKey: string;
  filename?: string;
  relativePath?: string;
  message?: string;
  metrics?: {
    source?: ContentSource;
    inputChars?: number;
    chunkCount?: number;
    wasTruncated?: boolean;
  };
}

export interface N8nFailureResponse {
  success: false;
  requestId?: string;
  errorCode?: string;
  message?: string;
}

export type N8nClientResult =
  | { ok: true; response: N8nSuccessResponse }
  | {
      ok: false;
      kind: "configuration" | "timeout" | "network" | "http" | "response";
      message: string;
      status?: number;
    };
