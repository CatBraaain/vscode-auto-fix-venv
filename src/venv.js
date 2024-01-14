const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Activator = require("./activator.js");

const targetScriptsDirs = ["Scripts", "bin"];
const targetActivators = [
  "activate",
  "activate.bat",
  "activate.csh",
  "activate.fish",
  "activate.nu",
];
const untargetActivators = ["Activate.ps1", "activate_this.py"];

class Venv {
  constructor(venvPath) {
    this.path = venvPath;
    this.workspacePath = path.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath);

    const dirNames = fs.readdirSync(this.path);
    const scriptsDirNames = dirNames.filter(dirName => targetScriptsDirs.includes(dirName));
    const scriptsDirPaths = scriptsDirNames.map(dirName => path.join(this.path, dirName));
    this.scriptsDirPath = scriptsDirPaths.filter(scriptDirPath =>
      fs.existsSync(path.join(scriptDirPath, "python.exe"))
    )[0];

    this.pythonPath = path.join(this.scriptsDirPath, "python.exe");
    this.pipPath = path.join(this.scriptsDirPath, "pip.exe");
    this.deactivatePath = path.join(this.scriptsDirPath, "deactivate");

    const fileNames = fs.readdirSync(this.scriptsDirPath);
    const activatorNames = fileNames
      .filter(dirName => targetActivators.includes(dirName))
      .filter(dirName => !untargetActivators.includes(dirName));
    const activatorPaths = activatorNames.map(dirName => path.join(this.scriptsDirPath, dirName));
    this.activators = activatorPaths.map(activatorPath => new Activator(activatorPath));
  }
}

module.exports = Venv;
