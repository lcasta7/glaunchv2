import GLib from "gi://GLib";
import Gio from "gi://Gio";

export default class Config {

	boundedApps: Set<string | undefined>;
	constructor() {
		const file = this._getConfigFile();
		const configMap = this._createConfigMap(file);

		this.boundedApps = new Set(
			configMap.filter((bind) => bind.app).map((bind) => bind.app),
		);
	}

	private _getConfigFile(): Gio.File {
		const configDir: string = `${GLib.get_home_dir()}/.config/glaunchv2`;
		const file: Gio.File = Gio.File.new_for_path(`${configDir}/glaunch.conf`);

		if (!file.query_exists(null)) {
			this._createConfigFile(configDir, file);
		}

		return file;
	}

	private _createConfigMap(
		file: Gio.File,
	): Array<{ com: string; key: string; app?: string }> {
		const [success, contents]: [boolean, Uint8Array, ...unknown[]] =
			file.load_contents(null);

		if (!success) {
			throw new Error("[GlaunchV2] Error Loading config file");
		}

		const config: Array<{ com: string; key: string; app?: string }> = [];
		const configurationLines = new TextDecoder("utf-8").decode(contents);
		configurationLines.split("\n").forEach((line, lineNumber) => {
			if (line.trim() === "" || line.trim().startsWith("#")) {
				return;
			}

			const parts = line.split(/\s+/);
			if (parts.length === 2) {
				config.push({
					com: parts[0],
					key: parts[1],
				});
			} else if (parts.length === 3) {
				config.push({
					com: parts[0],
					key: parts[1],
					app: parts[2],
				});
			} else {
				console.warn(
					`[GlaunchV2] Ignoring malformed config line ${lineNumber + 1}`,
				);
			}
		});

		return config;
	}

	private _createConfigFile(configDir: string, file: Gio.File) {
		try {
			const dir: Gio.File = Gio.File.new_for_path(configDir);
			if (!dir.query_exists(null)) {
				dir.make_directory_with_parents(null);
			}
			const outputStream = file.create(Gio.FileCreateFlags.NONE, null);

			const bytes = new TextEncoder().encode(`
				# App Shortcuts
				launch f9 firefox
				launch f11 code
				launch f11 gnome-terminal

				# Window Management
			        window_other f12`);

			outputStream.write_bytes(bytes, null);
			outputStream.close(null);
		} catch (error) {
			throw new Error(`[GlaunchV2] Error creating config file: ${error}`);
		}
	}
}
