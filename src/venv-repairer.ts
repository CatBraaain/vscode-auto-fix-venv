import path from "node:path";

import vscode from "vscode";

import Venv from "./venv.js";

export default class VenvRepairer {
  public static async getVenvs(): Promise<Venv[]> {
    const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
    const pythonPaths = pythonUris.map((pythonUri) => path.normalize(pythonUri.fsPath));
    const venvPaths = Array.from(
      new Set(pythonPaths.map((pythonPath) => path.join(pythonPath, "..", ".."))),
    );

    const venvs = venvPaths.map((venvPath) => new Venv(venvPath));
    return venvs;
  }

  public static async fixBrokenActivators(): Promise<void> {
    const venvs = await this.getVenvs();
    venvs.forEach((venv) =>
      venv.activators
        .filter((activator) => activator.isBroken)
        .forEach((activator) => activator.fixHardCodedPath()),
    );
  }

  public static async recreateVenvs(): Promise<void> {
    if (process.platform !== "win32") {
      vscode.window.showInformationMessage(
        "Recreate venvs: This commands is currently available in Windows only. I welcome pull request.",
      );
      return;
    }

    const venvs = await this.getVenvs();
    venvs.forEach(async (venv, index) => {
      const shouldRun = (await venv.isLocked()) ? await this._shouldForceRun() : true;
      if (shouldRun) {
        this._recreateVenv(venv, index);
      }
    });
  }

  private static async _shouldForceRun(): Promise<boolean> {
    // TODO: "always" option
    const answer = await vscode.window.showWarningMessage(
      "Recreate venvs: The venv file is being used by another process. Do you want to continue forcefully?",
      // "Always",
      // "Once",
      "Yes",
      "Cancel",
    );
    const shouldForceRun = answer === "Yes";
    return shouldForceRun;
  }

  private static _recreateVenv(venv, index): void {
    const commands = this._getCommands(venv, index);

    // TODO: option to run in background
    const terminal = this._getTerminal("auto-fix-venv", index);
    terminal.show();
    commands.forEach((command) => {
      // TODO: error check
      terminal.sendText(command);
    });
  }

  private static _getCommands(venv, index): string[] {
    const tempRequirementPath = `temp_requirements_${index}.txt`;
    const baseCommands = [
      `powershell -command "while ($processes = Get-Process | ? {$_.Path -eq """${venv.pythonPath}"""}){$processes | Stop-Process; Start-Sleep 1;}"`,
      `"${venv.deactivatePath}"`,
      `"${venv.pythonPath}" -m pip freeze > "${tempRequirementPath}"`,
      `rd /s /q "${venv.path}"`,
      `python -m venv "${venv.path}"`,
      // `python -m virtualenv ${venvPath}`,
      `"${venv.pythonPath}" -m pip install --upgrade pip`,
      `"${venv.pipPath}" install -r "${tempRequirementPath}"`,
      `del "${tempRequirementPath}"`,
      `echo "Finished recreating venv"`,
    ];

    const defaultTerminal = vscode.env.shell;
    const isPowershell = defaultTerminal.includes("powershell");
    const commands = isPowershell
      ? baseCommands.map((command) => `cmd.exe /c '${command.replaceAll("'", "''")}'`)
      : baseCommands;
    return commands;
  }

  private static _getTerminal(terminalName, index): vscode.Terminal {
    const existingTerminal = vscode.window.terminals.filter(
      (terminal) => terminal.name === terminalName,
    )[index];
    const terminal = existingTerminal
      ? existingTerminal
      : vscode.window.createTerminal(terminalName);
    return terminal;
  }
}
