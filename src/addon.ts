import { config } from "../package.json";
import type { DialogHelper } from "zotero-plugin-toolkit";
import hooks from "./hooks";

class Addon {
  public data: {
    alive: boolean;
    config: typeof config;
    // Env type, see build.js
    env: "development" | "production";
    initialized?: boolean;
    startupErrors: string[];
    locale?: {
      current: any;
    };
    dialog?: DialogHelper;
  };
  // Lifecycle hooks
  public hooks: typeof hooks;
  // APIs
  public api: object;

  constructor() {
    this.data = {
      alive: true,
      config,
      env: __env__,
      initialized: false,
      startupErrors: [],
    };
    this.hooks = hooks;
    this.api = {};
  }
}

export default Addon;
