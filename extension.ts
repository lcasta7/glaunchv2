import GLib from "gi://GLib";
import Gio from "gi://Gio";
import GObject from "gi://GObject";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import Config from "./config.js";
import Launcher from "./launcher.js";

export default class GlaunchV2 extends Extension {
	enable() {
		//set[string]App
		let appMap = new Map<string, Meta.Window>();
		const config = new Config();
		const launcher = new Launcher();



		global.window_manager.connect("map", (_, win: Meta.WindowActor) => {
			launcher.storeApp(win.get_meta_window()!)
		});

		global.window_manager.connect("destroy", (_, win: Meta.WindowActor) => {
			const metaWindow: Meta.Window = win.get_meta_window()!;
			const wmAppName: string = metaWindow?.get_wm_class() ?? "";
			if (appMap.has(wmAppName)) {
				appMap.delete(wmAppName);
			}
		});

		let settings: Gio.Settings = this.getSettings(
			"org.gnome.shell.extensions.glaunchv2",
		);

		Main.wm.addKeybinding(
			"f6",
			settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
			() => {
				console.log("[GlaunchV2] AppMap contents:");
				appMap.forEach((metaWin, key) => {
					console.log(`  Key: "${key}", Window ID: ${metaWin.get_id()}`);
				});
				console.log(`[GlaunchV2] Total entries: ${appMap.size}`);
			},
		);

		Main.wm.addKeybinding(
			"f7",
			settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
			() => {
				config.boundedApps.forEach((app) => {
					console.log(`[GlaunchV2] app bounded: ${app}`);
				});
			},
		);
	}

	disable() { }
}
