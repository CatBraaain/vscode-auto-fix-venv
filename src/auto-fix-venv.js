const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Venv = require("./venv.js");

class AutoFixVenv {
  static async autoFixActivators() {
    const venvs = await this.#getVenvs();
    venvs.forEach(venv =>
      venv.activators
        .filter(activator => activator.isBroken)
        .forEach(activator => activator.fixPath())
    );
  }

  static async #getVenvs() {
    const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
    const pythonPaths = pythonUris.map(pythonUri => path.normalize(pythonUri.fsPath));
    const venvPaths = Array.from(
      new Set(pythonPaths.map(pythonPath => path.join(pythonPath, "..", "..")))
    );

    const venvs = venvPaths.map(venvPath => new Venv(venvPath));
    return venvs;
  }

  static async recreate() {
    const venvs = await AutoFixVenv.#getVenvs();

    venvs.forEach((venv, index) => {
      const tempRequirementPath = `temp_requirements_${index}.txt`;
      const commands = [
        `${venv.pythonPath} -m pip freeze > ${tempRequirementPath}`,
        `${venv.deactivatePath}`,
        `python -m venv ${venv.path} --clear`,
        // `python -m virtualenv ${venvPath}`,
        `${venv.pythonPath} -m pip install --upgrade pip`,
        `${venv.pipPath} install -r ${tempRequirementPath}`,
        `del ${tempRequirementPath}`,
      ];

      const terminal = vscode.window.createTerminal("auto-fix-venv");
      terminal.show();
      commands.forEach(command => {
        // TODO: error check here
        terminal.sendText(`${command}`);
      });
    });
  }
}

module.exports = AutoFixVenv;
