import type { PluginSettings } from "../types/contracts";
import { getPref } from "../utils/prefs";

export const DEFAULT_SETTINGS: PluginSettings = {
  webhookURL: "http://127.0.0.1:5678/webhook/zotero-ai-reading",
  webhookToken: "",
  requestTimeoutSeconds: 180,
  useAbstractFallback: true,
  template: "academic_reading_v1",
  language: "zh-CN",
  subfolder: "Literature Notes",
};

export function getPluginSettings(): PluginSettings {
  return {
    webhookURL: getPref("webhookURL") || DEFAULT_SETTINGS.webhookURL,
    webhookToken: getPref("webhookToken") || "",
    requestTimeoutSeconds:
      getPref("requestTimeoutSeconds") ||
      DEFAULT_SETTINGS.requestTimeoutSeconds,
    useAbstractFallback: getPref("useAbstractFallback"),
    template: getPref("template") || DEFAULT_SETTINGS.template,
    language: getPref("language") || DEFAULT_SETTINGS.language,
    subfolder: getPref("subfolder") || DEFAULT_SETTINGS.subfolder,
  };
}
