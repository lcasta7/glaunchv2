import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

import Config from "./config.js";
import { App, AppCollection } from "./apps.js";

export default class Launcher {

	private _config: Config;
	private _settings: Gio.Settings;
	private _apps = new Map<string, AppCollection>();
	private _other = "other";

	constructor(config: Config, settings: Gio.Settings) {
		this._config = config;
		this._settings = settings;
		this._bindKeys();
	}


	storeApp(win: Meta.Window | null) {
		if (!win) {
			return;
		}

		let appName = win?.get_wm_class()?.toLowerCase().replace(/[0-9]/g, '') ?? "";

		if (appName === "" || appName === "gjs") return;
		if (win.window_type !== Meta.WindowType.NORMAL) return;

		const mapName = Gio.DesktopAppInfo?.search(appName)[0][0];
		if (this._apps.has(mapName)) {
			console.warn(`[GlaunchV2:2.0] Storing new app in existing mapping ${mapName}`);
			this._apps.get(mapName)?.storeApp(win);
		} else {
			console.warn(`[GlaunchV2:2.1] Storing new app in old mapping ${mapName}`);
			const app = new App(win);
			this._apps.set(mapName, new AppCollection(app));
		}

	}

	deleteApp(win: Meta.Window | null) {
		if (!win) {
			return
		}

		let appName: string = win?.get_wm_class() ?? "";
		if (!this._config.boundedApps.has(appName)) {
			appName = this._other;
		}

		if (this._apps.has(appName)) {
			const appCol = this._apps.get(appName);
			appCol?.deleteApp(win)

			if (appCol?.size() == 0) {
				this._apps.delete(appName);
			}
		}

	}

	private _handleApp(appName: string | undefined) {
		if (!appName) {
			return;
		}

		const focusedWin = global.display.focus_window;
		const focusedName = focusedWin?.get_wm_class()?.toLowerCase().replace(/[0-9]/g, '') ?? "";
		const focusedFile = Gio.DesktopAppInfo.search(focusedName)[0][0];

		const desktopFile = appName + ".desktop";

		if (desktopFile === focusedFile && this._apps.has(appName)) {
			this._apps.get(appName)?.goNext();
		} else if (this._apps.has(appName)) {
			console.warn(`[GlaunchV2:1.0] switching to map app ${focusedName}`);
			this._apps.get(appName)?.switchToApp();
		} else {
			console.warn(`[GlaunchV2:1.1] Adding new map app ${desktopFile}`);
			Gio.DesktopAppInfo.new(desktopFile)?.launch([], null);
		}
	}

	private _goToPrev() {
		const windows: Meta.Window[] = global.display.get_tab_list(Meta.TabList.NORMAL, null);
		if (windows.length < 2) {
			return;
		}

		new App(windows[1]).focus()
	}

	private _bindKeys() {
		this._config.entries.forEach((bind, _) => {
			switch (bind.act) {
				case "launch":
					Main.wm.addKeybinding(
						bind.key,
						this._settings,
						Meta.KeyBindingFlags.NONE,
						Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
						() => this._handleApp(bind.app))
					break;
				case "win_prev":
					Main.wm.addKeybinding(
						bind.key,
						this._settings,
						Meta.KeyBindingFlags.NONE,
						Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
						() => this._goToPrev())
					break;

			}

		})

	}

}
