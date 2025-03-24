import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class GlaunchV2 extends Extension {
	enable() {
		global.window_manager.connect('map', (_, win: Meta.WindowActor) => {
			console.log('GlaunchV2: sucessfully logged: ',
				win.get_meta_window()?.get_wm_class());
			const metaWin = win.get_meta_window()
			console.log("[GlaunchV2] wm_class:%s then_second:%s",
				metaWin?.get_wm_class(),
				metaWin?.get_id);

		})
	}

	disable() {
	}
}




// global.window_manager.connect('map', (_, actor) => {
// 	let metaWindow = actor.meta_window;
// 	this._storeApp(metaWindow);
// });
