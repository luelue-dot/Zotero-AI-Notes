import { config } from "../../package.json";

export async function registerPreferencePane(): Promise<void> {
  await Zotero.PreferencePanes.register({
    pluginID: config.addonID,
    src: "content/preferences.xhtml",
    id: `${config.addonRef}-preferences`,
    label: "AI-notes2obsidian",
    image: "content/icons/favicon.png",
  });
}
