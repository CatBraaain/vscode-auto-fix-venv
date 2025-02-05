import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import find from "find-process";
import vscode from "vscode";

import Venv from "./venv.js";

export default class VenvRepairer {
  public static async fixBrokenActivators(showNotification = false): Promise<void> {
    const venvs = await this.getVenvs();
    const brokenActivators = venvs.flatMap((venv) =>
      venv.activators.filter((activator) => activator.isBroken),
    );
    brokenActivators.forEach((activator) => activator.fixHardCodedPath());

    if (showNotification) {
      let message;
      if (venvs.length === 0) {
        message = "Auto Fix Venv: No venvs found";
      } else if (brokenActivators.length === 0) {
        message = "Auto Fix Venv: No broken venvs found";
      } else {
        message = "Auto Fix Venv: Successfully fixed venvs";
      }
      vscode.window.showInformationMessage(message);
    }
  }

  public static async getVenvs(): Promise<Venv[]> {
    const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
    const pythonPaths = pythonUris.map((pythonUri) => path.normalize(pythonUri.fsPath));
    const venvPaths = Array.from(
      new Set(pythonPaths.map((pythonPath) => path.join(pythonPath, "..", ".."))),
    );

    const venvs = venvPaths.map((venvPath) => new Venv(venvPath));
    return venvs;
  }

  public static async recreateVenvs(): Promise<void> {
    const venvs = await this.getVenvs();
    await Promise.all(
      venvs.map(async (venv, index) => {
        const shouldRun = (await venv.isLocked()) ? await this._shouldForceRun() : true;
        if (shouldRun) {
          await this._recreateVenv(venv, index);
        }
      }),
    );
    vscode.window.showInformationMessage("Auto Fix Venv: Successfully recreated venvs");
  }

  private static async _shouldForceRun(): Promise<boolean> {
    const FORCE_RUN_SECTION = "auto-fix-venv.forceRun";

    const config = vscode.workspace.getConfiguration();
    if (config.get(FORCE_RUN_SECTION)) {
      return true;
    }

    const answer = await vscode.window.showWarningMessage(
      "Recreate venvs: The venv directory is currently in use by another process. Do you want to forcefully recreate it?",
      "Always",
      "Once",
      "Cancel",
    );

    if (answer === "Always") {
      config.update(FORCE_RUN_SECTION, true, vscode.ConfigurationTarget.Global);
    }

    const shouldForceRun = answer === "Always" || answer === "Once";
    return shouldForceRun;
  }

  private static async _recreateVenv(venv: Venv, index: number): Promise<void> {
    await vscode.window.withProgress(
      {
        cancellable: false,
        location: vscode.ProgressLocation.Notification,
        title: `Recreate Venvs [${index}]`,
      },
      async (progress) => {
        progress.report({ message: "Saving pip packages ..." });
        const packages: string[] = execSync(`${venv.pythonPath} -m pip freeze`)
          .toString()
          .split("\n");

        progress.report({ message: "Killing venv process ..." });
        await this._killProcesses(venv, progress);

        progress.report({ message: "Deleting venv ..." });
        fs.rmSync(venv.path, { recursive: true, force: true });

        progress.report({ message: "Creating venv ..." });
        execSync(`python -m venv ${venv.path}`);

        progress.report({ message: "Upgrading pip ..." });
        execSync(`${venv.pythonPath} -m pip install --upgrade pip`);

        progress.report({ message: "Restoring pip packages ..." });
        execSync(`${venv.pipPath} install ${packages.join(" ")}`);

        progress.report({ message: `Done` });
      },
    );
  }

  private static async _killProcesses(venv: Venv, progress): Promise<void> {
    const { default: fkill } = await import("fkill");
    let targetProcesses: Process[] = [];
    let failureCount = 0;
    while (
      (targetProcesses = ((await find("name", "python.exe")) as Process[]).filter(
        (process) => process.bin === venv.pythonPath,
      )).length > 0
    ) {
      try {
        await fkill(
          targetProcesses.map((p) => p.pid),
          { force: true },
        );
      } catch {
        failureCount++;
        if (failureCount >= 10) {
          throw new Error("Failed to forcibly terminate the process 10 times.");
        }
      }
    }
  }
}

interface Process {
  pid: number;
  ppid?: number;
  uid?: number;
  gid?: number;
  bin: string;
  name: string;
  cmd: string;
}
