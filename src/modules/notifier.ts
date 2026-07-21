import { config } from "../../package.json";

export type NotificationType = "default" | "success" | "fail";

export function showNotification(
  text: string,
  type: NotificationType = "default",
): void {
  const progressWindow = new Zotero.ProgressWindow({
    closeOnClick: true,
  });
  progressWindow.changeHeadline(config.addonName);
  const line = new progressWindow.ItemProgress("", text);
  if (type === "fail") {
    line.setError();
  } else {
    line.setProgress(100);
  }
  progressWindow.show();
  progressWindow.startCloseTimer(6000);
}

export function createProgressNotifier(initialText: string) {
  const progressWindow = new Zotero.ProgressWindow({
    closeOnClick: true,
  });
  progressWindow.changeHeadline(config.addonName);
  const line = new progressWindow.ItemProgress("", initialText);
  line.setProgress(10);
  progressWindow.show();

  return {
    update(text: string, value: number): void {
      line.setText(text);
      line.setProgress(value);
    },
    succeed(text: string): void {
      line.setText(text);
      line.setProgress(100);
      progressWindow.startCloseTimer(8000);
    },
    fail(text: string): void {
      line.setText(text);
      line.setError();
      progressWindow.startCloseTimer(8000);
    },
  };
}
