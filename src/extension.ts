import vscode from "vscode";

import VenvRepairer from "./venv-repairer.js";

export async function activate(context) {
  VenvRepairer.fixBrokenActivators();

  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreateVenvs", () => {
      VenvRepairer.recreateVenvs();
    }),
  );
}
