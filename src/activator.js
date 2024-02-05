const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class Activator {
  constructor(activatorPath) {
    this.path = activatorPath;
    this.newVenvPath = path.join(this.path, "..", "..");

    this.oldSource = fs.readFileSync(this.path, "utf8");
    this.oldVenvPath = this.oldSource.match(/VIRTUAL_ENV\b[ ="']+([^"'\r\n]+)["']?$/im)[1];

    this.isBroken = this.oldVenvPath !== this.newVenvPath;
  }

  fixPath() {
    const newSource = this.oldSource.replace(this.oldVenvPath, this.newVenvPath);
    fs.writeFileSync(this.path, newSource);
  }
}

module.exports = Activator;
