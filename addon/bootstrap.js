/**
 * Most of this code is from Zotero team's official Make It Red example[1]
 * or the Zotero 7 documentation[2].
 * [1] https://github.com/zotero/make-it-red
 * [2] https://www.zotero.org/support/dev/zotero_7_for_developers
 */

function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  /**
   * Load the bundled script into Zotero's actual plugin sandbox. Zotero injects
   * privileged globals such as Zotero, Services, fetch, and timers into this
   * scope. Loading into a detached plain object would hide those globals.
   */
  const pluginScope = this;
  pluginScope.rootURI = rootURI;
  pluginScope._globalThis = pluginScope;

  Services.scriptloader.loadSubScript(
    `${rootURI}content/scripts/__addonRef__.js`,
    pluginScope,
  );
  await Zotero.__addonInstance__.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
  await Zotero.__addonInstance__?.hooks.onMainWindowLoad(window);
}

async function onMainWindowUnload({ window }, reason) {
  await Zotero.__addonInstance__?.hooks.onMainWindowUnload(window);
}

async function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  await Zotero.__addonInstance__?.hooks.onShutdown();
}

async function uninstall(data, reason) {}
