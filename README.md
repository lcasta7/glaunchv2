# GlaunchV2

A GNOME Shell extension for keyboard-driven window management and application launching with TypeScript.

## Overview

GlaunchV2 is a rewrite of the original Glaunch extension that allows you to:

- Launch applications with customizable keyboard shortcuts
- Quickly navigate between windows of the same application
- Switch to previously used windows
- Delete windows with keyboard shortcuts
- Auto-center the mouse pointer when switching between windows

## Features

- **Application Launching**: Bind keys to launch your favorite applications
- **Window Cycling**: Quickly cycle through windows of the same application
- **Window Management**: Navigate and delete windows without touching the mouse
- **Mouse Centering**: Automatically centers the mouse pointer when focusing windows
- **Simple Configuration**: Easy-to-edit configuration file

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/glaunchv2.git
   ```

2. Install the extension:
   ```
   cd glaunchv2
   make install
   ```

3. Restart GNOME Shell:
   - Press Alt+F2, type 'r', press Enter (X11)
   - Log out and log back in (Wayland)

4. Enable the extension using GNOME Extensions app or gnome-extensions-app

## Configuration

GlaunchV2 uses a simple configuration file located at `~/.config/glaunchv2/glaunch.conf`.

If the file doesn't exist, a default configuration will be created with the following shortcuts:

```
# App Shortcuts
# Apps
launch f9 firefox-esr
launch f10 code
launch f11 gnome-terminal

# Window Management
win_prev f4
win_other f12
win_delete f3
win_center_mouse
```

### Configuration Format

Each line in the configuration file follows one of these formats:

- `launch <key> <app-name>`: Binds a key to launch or focus an application
- `win_prev <key>`: Binds a key to switch to the previous window
- `win_other <key>`: Binds a key to switch between non-configured application windows
- `win_delete <key>`: Binds a key to close the focused window
- `win_center_mouse`: Switch to turn on mouse centering on applications

### Example Configuration

```
# Web Browser
launch f9 firefox-esr

# Code Editor
launch f10 code

# Terminal
launch f11 gnome-terminal

# Music Player
launch f5 spotify

# Window Management
win_prev f4
win_other f12
win_delete f3
win_center_mouse
```

## Usage

- Press the configured keys to launch applications
- When an application is already running, pressing its key will focus it
- If multiple windows of the same application are open, repeatedly pressing the key will cycle through them
- Use the win_prev key to switch to the previous window
- Use the win_delete key to close the focused window
- Use the win_other key to cycle through windows of non-configured applications

## How It Works

GlaunchV2 maintains collections of application windows grouped by their desktop names. When you press a shortcut key associated with an application:

1. If the application is not running, it launches the application
2. If the application is running with one window, it focuses that window
3. If the application has multiple windows, it cycles through them

Additionally, the extension automatically centers the mouse pointer when switching between windows, making it easier to interact with the newly focused window.

## Differences from Original Glaunch

GlaunchV2 is a complete rewrite of the original Glaunch extension with the following improvements:

- Written in TypeScript for better type safety and maintainability
- Improved window tracking and focus handling
- Better error handling and logging
- Automatic mouse pointer centering
- More robust configuration parsing

## Requirements

- GNOME Shell 46 or later
- TypeScript

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original Glaunch extension by lcasta7