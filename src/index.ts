import Addon from "./addon";
import { config } from "../package.json";

const zotero = _globalThis.Zotero;

// @ts-expect-error - Plugin instance is not typed
if (!zotero[config.addonInstance]) {
  _globalThis.addon = new Addon();
  // @ts-expect-error - Plugin instance is not typed
  zotero[config.addonInstance] = _globalThis.addon;
}
