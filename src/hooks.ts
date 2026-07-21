import { config } from "../package.json";
import type Addon from "./addon";
import { registerItemMenu, unregisterItemMenu } from "./modules/menu";
import { registerPreferencePane } from "./modules/preferencesPane";

async function onStartup(): Promise<void> {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  const plugin = getAddonInstance();
  plugin.data.startupErrors = [];

  await runStartupStep("preferences", registerPreferencePane);
  await runStartupStep("menu", async () => {
    for (const win of Zotero.getMainWindows()) {
      registerItemMenu(win);
    }
  });
  plugin.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  registerItemMenu(win);
}

async function onMainWindowUnload(win: Window): Promise<void> {
  unregisterItemMenu(win);
}

function onShutdown(): void {
  for (const win of Zotero.getMainWindows()) {
    unregisterItemMenu(win);
  }
  getAddonInstance().data.alive = false;
  // @ts-expect-error - Plugin instance is not typed
  delete Zotero[config.addonInstance];
}

function getAddonInstance(): Addon {
  // @ts-expect-error - Plugin instance is not typed
  return Zotero[config.addonInstance] as Addon;
}

async function runStartupStep(
  name: string,
  step: () => void | Promise<void>,
): Promise<void> {
  try {
    await step();
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    getAddonInstance().data.startupErrors.push(`${name}: ${message}`);
    Zotero.logError(
      new Error(`[${config.addonName}] ${name} startup failed: ${message}`),
    );
  }
}

function onPrefsEvent(_type: string, _data: Record<string, unknown>): void {}

// Kept as no-ops while the template's unregistered examples remain typechecked.
function onNotify(
  _event: string,
  _type: string,
  _ids: Array<string | number>,
  _extraData: Record<string, unknown>,
): void {}

function onShortcuts(_type: string): void {}

function onDialogEvents(_type: string): void {}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onPrefsEvent,
  onNotify,
  onShortcuts,
  onDialogEvents,
};
