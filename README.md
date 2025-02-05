# Auto Fix Venv

Automatically detect broken python venv and fix it.
Supports Windows, Linux, and macOS.

![flowchart](docs/flowchart.png)

## Features

- Automatically detects multiple virtual environments.
- Automatically fixes activation files for virtual environments (`activate`, `activate.bat`, `activate.csh`, `activate.fish`, `activate.nu`).

## Commands

- **`Auto Fix Venv: Fix venvs`** (`auto-fix-venv.fixVenvs`)  
  - Detects and fixes broken virtual environments. This command runs automatically at startup.

- **`Auto Fix Venv: Recreate venvs`** (`auto-fix-venv.recreateVenvs`)  
  - Recreates virtual environments. Can be configured to skip confirmation using `auto-fix-venv.forceRun`.
