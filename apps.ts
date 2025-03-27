import Meta from "gi://Meta";
import Clutter from 'gi://Clutter';

export class AppCollection {
	private _head: App;
	private _col: App[];
	private _hIndex: number = 0;


	constructor(app: App) {
		this._head = app;
		this._col = [app];
	}

	goNext() {
		this._hIndex = (this._hIndex + 1) % this._col.length;
		this._head = this._col[this._hIndex];
		this._head.focus();

	}

	storeApp(win: Meta.Window) {
		const app = new App(win)
		this._col.push(app);
		this._head = app;
		app.focus();
	}

	size() {
		return this._col.length;
	}

	deleteApp(win: Meta.Window) {
		const index = this._col.findIndex(w => w.equals(win))
		if (index === -1) {
			return;
		}

		if (this._head.equals(win) && this._col.length > 1) {
			this.goNext();
		}

		this._col.splice(index, 1)
	}

	switchToApp() {
		this._head.focus();
	}

}

export class App {
	private _win: Meta.Window;
	constructor(win: Meta.Window) {
		this._win = win
	}

	focus() {
		this._win.activate(global.get_current_time())
		this._centerMouse()
	}

	equals(win: Meta.Window): boolean {
		return win === this._win
	}

	private _centerMouse() {
		let rect = this._win.get_frame_rect();

		let x = rect.x + rect.width / 2;
		let y = rect.y + rect.height / 2;

		let seat = Clutter.get_default_backend().get_default_seat();
		seat.warp_pointer(x, y);
	}
}
