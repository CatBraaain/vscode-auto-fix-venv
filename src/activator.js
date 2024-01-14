const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class Activator {
  constructor(activatorPath) {
    this.path = activatorPath;
    this.newVenvPath = path.join(this.path, "..", "..");

    this.sourceCode = fs.readFileSync(this.path, "utf8");
    this.oldVenvPath = this.sourceCode.match(/VIRTUAL_ENV\b[ ="']+([^"'\r\n]+)["']?$/im)[1];

    this.isBroken = this.oldVenvPath !== this.newVenvPath;
  }

  fixPath() {
    const newSourceCode = this.sourceCode.replace(this.oldVenvPath, this.newVenvPath);
    fs.writeFileSync(this.path, newSourceCode);
  }
}

module.exports = Activator;
