import vscode from "vscode";

import VenvRepairer from "./venv-repairer.js";

async function activate(context) {
  VenvRepairer.fixBrokenActivators();

  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreateVenvs", () => {
      VenvRepairer.recreateVenvs();
    })
  );

  return;
}

function deactivate() {
  return undefined;
}

export { activate, deactivate };
