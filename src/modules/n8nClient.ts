import type {
  N8nClientResult,
  N8nRequestPayload,
  N8nSuccessResponse,
  PluginSettings,
} from "../types/contracts";

export class N8nClient {
  async send(
    payload: N8nRequestPayload,
    settings: PluginSettings,
  ): Promise<N8nClientResult> {
    const webhookURL =
      typeof settings.webhookURL === "string" ? settings.webhookURL.trim() : "";
    const webhookToken =
      typeof settings.webhookToken === "string"
        ? settings.webhookToken.trim()
        : "";

    if (!/^https?:\/\//i.test(webhookURL)) {
      return {
        ok: false,
        kind: "configuration",
        message: "Webhook URL 必须以 http:// 或 https:// 开头。",
      };
    }
    if (!webhookToken) {
      return {
        ok: false,
        kind: "configuration",
        message: "请先在插件设置中填写 Webhook Token。",
      };
    }

    try {
      const response = await Zotero.HTTP.request("POST", webhookURL, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Workflow-Token": webhookToken,
        },
        body: JSON.stringify(payload),
        responseType: "text",
        timeout: normalizeTimeout(settings.requestTimeoutSeconds),
        successCodes: false,
        errorDelayMax: 0,
        logBodyLength: 0,
        debug: false,
      });
      const parsed = parseJSON(response.responseText ?? "");
      if (response.status === 0) {
        return {
          ok: false,
          kind: "network",
          message: "无法连接 n8n，请检查其是否运行及 Webhook URL。",
        };
      }
      const responseOK = response.status >= 200 && response.status < 300;
      if (responseOK && isSuccessResponse(parsed)) {
        return { ok: true, response: parsed };
      }
      if (!responseOK) {
        return {
          ok: false,
          kind: "http",
          status: response.status,
          message: getMessage(parsed) ?? `n8n 返回 HTTP ${response.status}。`,
        };
      }
      return {
        ok: false,
        kind: "response",
        status: response.status,
        message: getMessage(parsed) ?? "n8n 返回了无效的响应。",
      };
    } catch (error) {
      if (isTimeoutError(error)) {
        return {
          ok: false,
          kind: "timeout",
          message: "n8n处理超时，请检查工作流执行记录。",
        };
      }
      return {
        ok: false,
        kind: "network",
        message: "无法连接 n8n，请检查其是否运行及 Webhook URL。",
      };
    }
  }
}

function normalizeTimeout(value: number): number {
  const seconds = Number(value);
  return Math.max(1, Number.isFinite(seconds) ? seconds : 180) * 1000;
}

function isTimeoutError(error: unknown): boolean {
  const name =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string"
      ? error.name
      : "";
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";
  return /timeout|timed out/i.test(`${name} ${message}`);
}

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessResponse(value: unknown): value is N8nSuccessResponse {
  return isRecord(value) && value.success === true;
}

function getMessage(value: unknown): string | undefined {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : undefined;
}
