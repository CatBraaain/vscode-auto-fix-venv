import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import vscode from "vscode";

import Activator from "./activator.js";

const targetDirNames = ["Scripts", "bin"];
const targetActivatorNames = [
  "activate",
  "activate.bat",
  "activate.csh",
  "activate.fish",
  "activate.nu",
];
// const untargetActivatorNames = ["Activate.ps1", "activate_this.py"];

export default class Venv {
  public path: string;
  public scriptDirPath: string;
  public pythonPath: string;
  public pipPath: string;
  public deactivatePath: string;
  public activators: Activator[];
  public isLocked: boolean;

  public constructor(venvPath) {
    this.path = venvPath;
    this.scriptDirPath = this._getScriptDirPath();
    this.pythonPath = path.join(this.scriptDirPath, "python.exe");
    this.pipPath = path.join(this.scriptDirPath, "pip.exe");
    this.deactivatePath = path.join(this.scriptDirPath, "deactivate");
    this.activators = this._getActivators();
    this.isLocked = this._isLocked();
  }

  private _getScriptDirPath(): string {
    const dirNames = fs.readdirSync(this.path);
    const scriptDirNames = dirNames.filter(dirName => targetDirNames.includes(dirName));
    const scriptDirPaths = scriptDirNames.map(dirName => path.join(this.path, dirName));
    const scriptDirPath = scriptDirPaths.find(scriptDirPath =>
      fs.existsSync(path.join(scriptDirPath, "python.exe"))
    )!;
    return scriptDirPath;
  }

  private _getActivators(): Activator[] {
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

  private _isLocked(): boolean {
    if (process.platform === "win32") {
      const problemProcessesCount = Number(
        execSync(`(Get-Process | ? {$_.Path -eq "${this.pythonPath}"}).Count`, {
          shell: "powershell",
        }).toString()
      );
      const isLocked = problemProcessesCount > 0;
      return isLocked;
    } else {
      return true;
    }
  }
}
