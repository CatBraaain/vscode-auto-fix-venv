const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class Venv {
  async init() {
    const curFolderUri = vscode.workspace.workspaceFolders[0].uri;

    this.curPath = path.join(curFolderUri.fsPath, ".venv");
    this.batPath = path.join(this.curPath, "Scripts", "activate.bat");

    this.batStr = fs.readFileSync(this.batPath, "utf8");
    this.oldPath = this.batStr.match(/(?<=^set VIRTUAL_ENV=).*$/m)[0];

    this.isBroken = this.oldPath !== this.curPath;
  }

  static async autoFixPath() {
    const venv = new this();
    await venv.init();
    if (venv.isBroken) {
      await venv.fixPath();
    }
  }

  async fixPath() {
    const newBatStr = this.batStr.replace(this.oldPath, this.curPath);
    fs.writeFileSync(this.batPath, newBatStr);
  }

  static recreate() {
    const commands = [
      ".venv\\Scripts\\python.exe -m pip freeze > temp_requirements.txt",
      ".venv\\Scripts\\deactivate.bat",
      "python -m venv .venv --clear",
      ".venv\\Scripts\\activate.bat",
      ".venv\\Scripts\\python.exe -m pip install --upgrade pip",
      ".venv\\Scripts\\pip.exe install -r temp_requirements.txt",
      "del temp_requirements.txt",
    ];

    const terminal = vscode.window.createTerminal("revenv");
    terminal.show();
    commands.forEach(command => {
      // TODO: error check here
      terminal.sendText(`${command}`);
    });
  }
}

module.exports = Venv;
