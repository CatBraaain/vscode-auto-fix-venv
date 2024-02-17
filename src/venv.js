const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Activator = require("./activator.js");
const { execSync } = require("child_process");

const targetDirNames = ["Scripts", "bin"];
const targetActivatorNames = [
  "activate",
  "activate.bat",
  "activate.csh",
  "activate.fish",
  "activate.nu",
];
// const untargetActivatorNames = ["Activate.ps1", "activate_this.py"];

class Venv {
  constructor(venvPath) {
    this.path = venvPath;
    this.scriptDirPath = this.getScriptDirPath();
    this.pythonPath = path.join(this.scriptDirPath, "python.exe");
    this.pipPath = path.join(this.scriptDirPath, "pip.exe");
    this.deactivatePath = path.join(this.scriptDirPath, "deactivate");
    this.activators = this.getActivators();

    if (process.platform == "win32") {
      this.isLocked = this.getIsLocked();
    }
  }

  getScriptDirPath() {
    const dirNames = fs.readdirSync(this.path);
    const scriptDirNames = dirNames.filter(dirName => targetDirNames.includes(dirName));
    const scriptDirPaths = scriptDirNames.map(dirName => path.join(this.path, dirName));
    const scriptDirPath = scriptDirPaths.find(scriptDirPath =>
      fs.existsSync(path.join(scriptDirPath, "python.exe"))
    );
    return scriptDirPath;
  }

  getActivators() {
    const scriptFileNames = fs.readdirSync(this.scriptDirPath);
    const activatorNames = scriptFileNames.filter(scriptFileName =>
      targetActivatorNames.includes(scriptFileName)
    );
    const activatorPaths = activatorNames.map(activatorName =>
      path.join(this.scriptDirPath, activatorName)
    );
    const activators = activatorPaths.map(activatorPath => new Activator(activatorPath));
    return activators;
  }

  getIsLocked() {
    const problemProcessesCount = execSync(
      `(Get-Process | ? {$_.Path -eq "${this.pythonPath}"}).Count`,
      {
        shell: "powershell",
      }
    ).toString();
    const isLocked = problemProcessesCount > 0;
    return isLocked;
  }
}

module.exports = Venv;
