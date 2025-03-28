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
	private _bounded = new Set<string>();
	private _other = "other";


	constructor(config: Config, settings: Gio.Settings) {
		this._config = config;
		this._settings = settings;
		this._bindKeys();
		this._apps = this._startUpMapping()
	}

	storeApp(win: Meta.Window) {
		if (win.get_wm_class_instance() === 'gjs') return;
		if (win.get_window_type() !== Meta.WindowType.NORMAL) return;

		let mapName = this._retrieveMapName(win)
		if (this._apps.has(mapName)) {
			console.log(`[GlaunchV2] Storing new app in existing mapping ${mapName}`);
			this._apps.get(mapName)?.storeApp(win);
		} else {
			console.log(`[GlaunchV2] Storing new app in old mapping ${mapName}`);
			const app = new App(win);
			this._apps.set(mapName, new AppCollection(app));
		}

	}

	deleteApp(win: Meta.Window) {
		const mapName = this._retrieveMapName(win);
		const appCol = this._apps.get(mapName);
		if (appCol) {
			appCol.deleteApp(win);
			if (appCol.size() === 0) {
				this._apps.delete(mapName);
			}
		}
	}


	private _handleApp(appName: string) {
		const focusedName = this._retrieveMapName(global.display.focus_window);
		console.log(`[GlaunchV2] focusedName: ${focusedName}`);

		const appInfo = Gio.DesktopAppInfo.new(appName + ".desktop");

		console.log(`[GlaunchV2] appName: ${appName}`);
		console.log(`[GlaunchV2] appInfo: ${appInfo ? "found" : "null"}`);

		let appDesktopName = appInfo?.get_locale_string("Name") ?? "other";
		console.log(`[GlaunchV2] appDesktopName: ${appDesktopName}`);

		console.log(`[GlaunchV2] _apps has ${appDesktopName}:`, this._apps.has(appDesktopName));

		if (!appDesktopName) {
			// App not found, could throw an exception here
			console.log(`[GlaunchV2] Error: No desktop name found for ${appName}.desktop`);
			return;
		}

		if (focusedName === appDesktopName && this._apps.has(appDesktopName)) {
			console.log(`[GlaunchV2] Focused app matches requested app, going to next window`);
			this._apps.get(appDesktopName)?.goNext();
		} else if (this._apps.has(appDesktopName)) {
			console.log(`[GlaunchV2] App found in _apps but not focused, switching to it`);
			this._apps.get(appDesktopName)?.switchToApp();
		} else {
			console.log(`[GlaunchV2] App not tracked, launching new instance`);
			appInfo?.launch([], null);
		}
	}

	private _goToPrev() {
		const mruWindows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
		if (mruWindows.length < 2) return;
		new App(mruWindows[1]).focus();

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
						() => this._handleApp(bind.app!))
					this._bounded.add(Gio.DesktopAppInfo.new(bind.app! + ".desktop").get_locale_string("Name")!)
					break;
				case "win_other":
					Main.wm.addKeybinding(
						bind.key,
						this._settings,
						Meta.KeyBindingFlags.NONE,
						Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
						() => this._handleApp(this._other))
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

	private _startUpMapping() {
		let openedAppsMap = new Map();
		let openedApps = global.display.get_tab_list(Meta.TabList.NORMAL, null)

		openedApps.forEach(appInstance => {
			const mapName = this._retrieveMapName(appInstance)

			if (openedAppsMap.has(mapName)) {
				openedAppsMap.get(mapName)?.storeApp(appInstance)
			} else {
				openedAppsMap.set(mapName, new AppCollection(new App(appInstance)))
			}
		})

		return openedAppsMap
	}

	private _retrieveMapName(win: Meta.Window): string {
		const appName: string = win?.get_wm_class()?.toLowerCase().replace(/[0-9]/g, '') ?? "";
		const appResults = Gio.DesktopAppInfo.search(appName)?.[0] ?? [];
		const appFileName = appResults.length > 0
			? appResults.reduce((shortest, current) =>
				current.length < shortest.length ? current : shortest,
				appResults[0])
			: "";
		const appInfo = appFileName ? Gio.DesktopAppInfo.new(appFileName) : null;
		const appDesktopName = appInfo?.get_locale_string("Name") ?? "";

		return this._bounded.has(appDesktopName) ? appDesktopName : this._other;
	}


}
