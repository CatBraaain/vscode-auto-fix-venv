import fs from "fs";
import path from "path";
import vscode from "vscode";

export default class Activator {
  public path: string;

  public oldSource: string;
  public oldHardCodedVenvPath: string | undefined;
  public newSource: string;
  public newHardCodedVenvPath: string;

  public isBroken: boolean;

  public constructor(activatorPath) {
    this.path = activatorPath;

    this.oldSource = fs.readFileSync(this.path, "utf8");
    this.oldHardCodedVenvPath = this.oldSource
      .match(/VIRTUAL_ENV\b[ ="']+([^"'\r\n]+)["']?$/im)
      ?.at(1);

    this.newHardCodedVenvPath = path.join(this.path, "..", "..");
    this.newSource = this.oldSource.replace(
      this.oldHardCodedVenvPath || /(?=impossible)toMatch/,
      this.newHardCodedVenvPath
    );

    this.isBroken = this.oldHardCodedVenvPath !== this.newHardCodedVenvPath;
  }

  public fixHardCodedPath(): void {
    fs.writeFileSync(this.path, this.newSource);
  }
}
