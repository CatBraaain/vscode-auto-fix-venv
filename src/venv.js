const vscode = require("vscode");
const fs = vscode.workspace.fs;

class Venv {
  async init() {
    const curFolderUri = vscode.workspace.workspaceFolders[0].uri;
    this.curUri = curFolderUri.with({ path: `${curFolderUri.path}/.venv` });

    this.batUri = this.curUri.with({ path: `${this.curUri.path}/Scripts/activate.bat` });
    this.batBytes = await fs.readFile(this.batUri);
    this.batStr = Buffer.from(this.batBytes).toString("utf8");

    this.oldPath = this.batStr.match(/(?<=^set VIRTUAL_ENV=).*$/m)[0];
    this.oldUri = vscode.Uri.file(this.oldPath);

    this.isBroken = this.oldUri.fsPath !== this.curUri.fsPath;
  }

  static async autoFixPath() {
    const venv = new this();
    await venv.init();
    if (venv.isBroken) {
      await venv.fixPath();
      // vscode.commands.executeCommand("auto-revenv.revenv");
    }
  }

  async fixPath() {
    const writeStr = this.batStr.replace(this.oldPath, this.curUri.fsPath);
    const writeBytes = Buffer.from(writeStr, "utf8");
    await fs.writeFile(this.batUri, writeBytes);
  }

  static recreate() {
    const commands = [
      ".venv\\Scripts\\python -m pip freeze > temp_requirements.txt",
      ".venv\\Scripts\\deactivate.bat",
      "python -m venv .venv --clear",
      ".venv\\Scripts\\activate.bat",
      "python -m pip install --upgrade pip",
      "pip install -r temp_requirements.txt",
      "del temp_requirements.txt",
    ];

    const terminal = vscode.window.createTerminal("revenv");
    terminal.show();
    commands.forEach(command => {
      terminal.sendText(`${command}`);
    });
  }
}

module.exports = Venv;
