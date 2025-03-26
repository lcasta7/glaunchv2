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

		const config = new Config();
		const settings: Gio.Settings = this.getSettings("org.gnome.shell.extensions.glaunchv2");
		const launcher = new Launcher(config, settings);

		global.window_manager.connect("map", (_, win: Meta.WindowActor) => {
			launcher.storeApp(win?.get_meta_window());
		});

		global.window_manager.connect("destroy", (_, win: Meta.WindowActor) => {
			launcher.deleteApp(win?.get_meta_window());
		});

	}

	disable() { }
}
