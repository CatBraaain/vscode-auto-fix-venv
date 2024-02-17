const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Venv = require("./venv.js");

async function getVenvs() {
  const pythonUris = await vscode.workspace.findFiles("**/{Scripts,bin}/python.exe");
  const pythonPaths = pythonUris.map(pythonUri => path.normalize(pythonUri.fsPath));
  const venvPaths = Array.from(
    new Set(pythonPaths.map(pythonPath => path.join(pythonPath, "..", "..")))
  );

  const venvs = venvPaths.map(venvPath => new Venv(venvPath));
  return venvs;
}

module.exports = getVenvs;
