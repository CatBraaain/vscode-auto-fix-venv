const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const autoFixActivators = require("./auto-fix-activators.js");
const recreateVenvs = require("./recreate-venvs.js");

async function activate(context) {
  await autoFixActivators();

  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreateVenvs", async () => {
      await recreateVenvs();
    })
  );

  return;
}

function deactivate() {
  return undefined;
}

// console.log("for debug message");
// vscode.window.showInformationMessage("for debug message");

module.exports = { activate, deactivate };
