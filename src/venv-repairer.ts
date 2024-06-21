import { execSync } from "child_process";
import find from "find-process";
import fs from "fs";
import path from "path";
import { setTimeout } from "timers/promises";
import vscode from "vscode";

import Venv from "./venv.js";

export default class VenvRepairer {
  private static async _getVenvs(): Promise<Venv[]> {
    const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
    const pythonPaths = pythonUris.map(pythonUri => path.normalize(pythonUri.fsPath)); // fsPath is cross-platform
    const venvPaths = Array.from(
      new Set(pythonPaths.map(pythonPath => path.join(pythonPath, "..", "..")))
    );

    const venvs = venvPaths.map(venvPath => new Venv(venvPath));
    return venvs;
  }

  public static async fixBrokenActivators(): Promise<void> {
    const venvs = await this._getVenvs();
    venvs.forEach(venv =>
      venv.activators
        .filter(activator => activator.isBroken)
        .forEach(activator => activator.fixHardCodedPath())
    );
  }

  public static async recreateVenvs(): Promise<void> {
    const venvs = await this._getVenvs();
    venvs.forEach(async (venv, index) => {
      const shouldRun = (await venv.isLocked()) ? await this._shouldRunForcefully() : true;
      if (shouldRun) {
        this._recreateVenv(venv, index);
      }
    });
  }

  private static async _shouldRunForcefully(): Promise<boolean> {
    // TODO: add "always" option
    const answer = await vscode.window.showWarningMessage(
      "Recreate venvs: The venv file is being used by another process. Do you want to continue forcefully?",
      // "Always",
      // "Once",
      "Yes",
      "Cancel"
    );
    const shouldForceRun = answer === "Yes";
    return shouldForceRun;
  }

  private static async _recreateVenv(venv, index): Promise<void> {
    const tempRequirementPath = `temp_requirements_${index}.txt`;

    await this._killBlockingProcess(venv);
    // add error check on execSync
    execSync(`"${venv.deactivatePath}"`);
    execSync(`"${venv.pythonPath}" -m pip freeze > "${tempRequirementPath}"`);
    fs.rmSync(venv.path, { force: true, recursive: true });
    execSync(`python -m venv "${venv.path}"`);
    execSync(`"${venv.pythonPath}" -m pip install --upgrade pip`);
    execSync(`"${venv.pipPath}" install -r "${tempRequirementPath}"`);
    fs.rmSync(tempRequirementPath, { force: true });
  }

  private static async _killBlockingProcess(venv) {
    while (true) {
      const prosesses = await find("name", ".*?");
      const blockingProcesses = prosesses.filter(prosess => prosess["bin"] === venv.pythonPath);
      if (blockingProcesses.length === 0) {
        break;
      } else {
        blockingProcesses.forEach(blockingProcess => {
          process.kill(blockingProcess.pid);
        });
        await setTimeout(1000);
      }
    }
  }
}
