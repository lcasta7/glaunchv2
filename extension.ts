import Gio from "gi://Gio";
import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import Config from "./config.js";
import Launcher from "./launcher.js";

export default class GlaunchV2 extends Extension {
	private _config: Config | null = null;
	private _settings: Gio.Settings | null = null;

	enable() {
		this._config = new Config();
		this._settings = this.getSettings();
		const launcher = new Launcher(this._config, this._settings);
		global.window_manager.connect("map", (_, win: Meta.WindowActor) => {
			launcher.storeApp(win.get_meta_window()!)
		});
		global.window_manager.connect("destroy", (_, win: Meta.WindowActor) => {
			launcher.deleteApp(win.get_meta_window()!);
		});
	}

	disable() {
		this._config!.entries.forEach((bind, _) => {
			Main.wm.removeKeybinding(bind.key)
		});

		if (this._settings) {
			this._settings.run_dispose();
			this._settings = null;
		}
	}
}
