const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Venv = require("./venv.js");
const getVenvs = require("./get-venvs.js");

async function autoFixActivators() {
  const venvs = await getVenvs();
  console.log(venvs);
  venvs.forEach(venv =>
    venv.activators
      .filter(activator => activator.isBroken)
      .forEach(activator => activator.fixPath())
  );
}

module.exports = autoFixActivators;
