const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Venv = require("./venv.js");

class AutoFixVenv {
  constructor() {
    this.defaultTerminal = vscode.env.shell;
    this.isPowershell = this.defaultTerminal.includes("powershell");
  }

  async autoFixActivators() {
    const venvs = await this.#getVenvs();
    venvs.forEach(venv =>
      venv.activators
        .filter(activator => activator.isBroken)
        .forEach(activator => activator.fixPath())
    );
  }

  async #getVenvs() {
    const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
    const pythonPaths = pythonUris.map(pythonUri => path.normalize(pythonUri.fsPath));
    const venvPaths = Array.from(
      new Set(pythonPaths.map(pythonPath => path.join(pythonPath, "..", "..")))
    );

    const venvs = venvPaths.map(venvPath => new Venv(venvPath));
    return venvs;
  }

  async recreateVenvs() {
    const isIsortOn = vscode.extensions.getExtension("ms-python.isort")?.isActive;
    const wasIsortOn = isIsortOn;
    if (isIsortOn) {
      vscode.window.showInformationMessage(
        "Auto Fix Venv: this command not working when isort extension is on"
      );
      return;
    }

    const venvs = await this.#getVenvs();

    venvs.forEach((venv, index) => {
      this.#recreateVenv(venv, index);
    });
  }

  #recreateVenv(venv, index) {
    const tempRequirementPath = `temp_requirements_${index}.txt`;
    let commands = [
      `"${venv.deactivatePath}"`,
      `"${venv.pythonPath}" -m pip freeze > "${tempRequirementPath}"`,
      `python -m venv "${venv.path}" --clear`,
      // `python -m virtualenv ${venvPath}`,
      `"${venv.pythonPath}" -m pip install --upgrade pip`,
      `"${venv.pipPath}" install -r "${tempRequirementPath}"`,
      `del "${tempRequirementPath}"`,
    ];
    if (this.isPowershell) {
      commands = commands.map(command => `& ${command}`);
    }

    const terminal = this.#getTerminal("auto-fix-venv", index);
    terminal.show();
    commands.forEach(command => {
      terminal.sendText(`${command}`);
    });
  }

  #getTerminal(terminalName, index) {
    const existingTerminal = vscode.window.terminals.filter(
      terminal => terminal.name === terminalName
    )[index];
    const terminal = existingTerminal
      ? existingTerminal
      : vscode.window.createTerminal(terminalName);
    return terminal;
  }
}

module.exports = AutoFixVenv;
