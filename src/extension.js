const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const AutoFixVenv = require("./auto-fix-venv.js");

async function activate(context) {
  const autoFixVenv = new AutoFixVenv();
  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreateVenvs", () => {
      autoFixVenv.recreateVenvs();
    })
  );

  await autoFixVenv.autoFixActivators();

  return;
}

function deactivate() {
  return undefined;
}

// console.log("for debug message");
// vscode.window.showInformationMessage("for debug message");

module.exports = { activate, deactivate };
