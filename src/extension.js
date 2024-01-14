const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const autoFixVenv = require("./auto-fix-venv.js");

async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreate", autoFixVenv.recreate)
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
