import type {
  N8nRequestPayload,
  PaperContent,
  PaperMetadata,
  PluginSettings,
} from "../types/contracts";

export function createRequestId(itemKey: string): string {
  return `${itemKey}-${Date.now()}`;
}

export function buildPayload(
  requestId: string,
  item: PaperMetadata,
  content: PaperContent,
  settings: PluginSettings,
): N8nRequestPayload {
  return {
    requestId,
    item,
    content,
    options: {
      template: settings.template,
      language: settings.language,
      subfolder: settings.subfolder,
    },
  };
}
