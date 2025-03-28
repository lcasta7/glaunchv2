import Gio from "gi://Gio";
import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import Config from "./config.js";
import Launcher from "./launcher.js";

export default class GlaunchV2 extends Extension {
	private _config: Config | null = null;
	private _settings: Gio.Settings | null = null;
	private _launcher: Launcher | null = null;
	private _signalHandlers: number[] = [];

	enable() {
		this._config = new Config();
		this._settings = this.getSettings();
		this._launcher = new Launcher(this._config, this._settings);

		this._signalHandlers.push(
			global.window_manager.connect("map", (_, win: Meta.WindowActor) => {
				this._launcher?.storeApp(win.get_meta_window())
			})
		);
		this._signalHandlers.push(
			global.window_manager.connect("destroy", (_, win: Meta.WindowActor) => {
				this._launcher?.deleteApp(win.get_meta_window());
			})
		);
	}

	disable() {
		this._signalHandlers.forEach(id => {
			global.window_manager.disconnect(id);
		});
		this._signalHandlers = [];

		this._config?.entries.forEach((bind, _) => {
			if (bind.key) {
				Main.wm.removeKeybinding(bind.key!)
			}
		});

		this._settings?.run_dispose();
		this._settings = null;
		this._config = null;
		this._launcher = null;
	}
}
