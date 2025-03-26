import Meta from "gi://Meta";
import Gio from "gi://Gio";


export default class Launcher {

	constructor() {

	}

	//focus on handle and store first
	storeApp(win: Meta.Window, key?: string) {
		let appName = win?.get_wm_class()?.toLowerCase().replace(/[0-9]/g, '') ?? "";
		if (win?.get_wm_class_instance() === 'gjs') return
		if (win?.window_type !== Meta.WindowType.NORMAL) return;


		// get the desktop using the id from win
		// Gio.DesktopAppInfo.new(win.get_id().toString())

		console.log("win-id" + win.get_id())
		console.log("win-id" + win.get_gtk_application_id())
		console.log("win-id" + win.get_startup_id())

	}

}
