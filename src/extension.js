const vscode = require("vscode");
const Venv = require("./venv.js");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("auto-fix-venv.recreate", Venv.recreate)
  );

  Venv.autoFixPath();

  return;
}

function deactivate() {
  return undefined;
}

// console.log("for debug message");
// vscode.window.showInformationMessage("for debug message");

module.exports = { activate, deactivate };
