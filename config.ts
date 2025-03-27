import GLib from "gi://GLib";
import Gio from "gi://Gio";

const DEFAULT_CONFIG = `# App Shortcuts
launch f9 firefox
launch f10 code
launch f11 gnome-terminal

# Window Management
window_prev f4`;

interface ConfigEntry {
	act: string;
	key: string;
	app?: string;
}


export default class Config {


	public boundedApps: Set<string | undefined>;
	entries: ConfigEntry[];
	constructor() {
		const file = this._getConfigFile();
		this.entries = this._createConfigMap(file);

		this.boundedApps = new Set(
			this.entries.filter((bind) => bind.app !== undefined).map((bind) => bind.app),
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
	): ConfigEntry[] {
		const [success, contents]: [boolean, Uint8Array, ...unknown[]] =
			file.load_contents(null);

		if (!success) {
			throw new Error("[GlaunchV2] Error Loading config file");
		}

		const config: ConfigEntry[] = [];
		const configurationLines = new TextDecoder("utf-8").decode(contents);
		configurationLines.split("\n").forEach((line, lineNumber) => {
			if (line.trim() === "" || line.trim().startsWith("#")) {
				return;
			}

			const parts = line.split(/\s+/);
			if (parts.length === 2) {
				config.push({
					act: parts[0],
					key: parts[1],
				});
			} else if (parts.length === 3) {
				config.push({
					act: parts[0],
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

			const bytes = new TextEncoder().encode(DEFAULT_CONFIG);

			outputStream.write_bytes(bytes, null);
			outputStream.close(null);
		} catch (error) {
			throw new Error(`[GlaunchV2] Error creating config file: ${error}`);
		}
	}
}
