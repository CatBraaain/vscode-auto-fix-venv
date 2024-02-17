const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Venv = require("./venv.js");
const getVenvs = require("./get-venvs.js");

async function recreateVenvs() {
  const shouldReturn = getShouldReturn();
  if (shouldReturn) {
    return;
  }

  const venvs = await getVenvs();

  await venvs.forEach(async (venv, index) => {
    const shouldRun = venv.isLocked ? await getShouldRun() : true;
    if (shouldRun) {
      recreateVenv(venv, index, shouldRun);
    }
  });
}

function getShouldReturn() {
  if (process.platform != "win32") {
    vscode.window.showInformationMessage(
      "Recreate venvs: This commands is currently available in Windows only. I welcome pull request."
    );
    return true;
  } else {
    return false;
  }
}

async function getShouldRun() {
  // TODO: "always" option
  const answer = await vscode.window.showWarningMessage(
    "Recreate venvs: The venv file is being used by another process. Do you want to continue forcefully?",
    // "Always",
    // "Once",
    "Yes",
    "Cancel"
  );
  const shouldRun = answer == "Yes";
  return shouldRun;
}

function recreateVenv(venv, index) {
  const commands = getCommands(venv, index);

  // TODO: option to run in background
  const terminal = getTerminal("auto-fix-venv", index);
  terminal.show();
  commands.forEach(command => {
    // TODO: error check
    terminal.sendText(`${command}`);
  });
}

function getCommands(venv, index) {
  const tempRequirementPath = `temp_requirements_${index}.txt`;
  const baseCommands = [
    `powershell -command "while ($processes = Get-Process | ? {$_.Path -eq """${venv.pythonPath}"""}){$processes | Stop-Process; Start-Sleep 1;}"`,
    `"${venv.deactivatePath}"`,
    `"${venv.pythonPath}" -m pip freeze > "${tempRequirementPath}"`,
    `rd /s /q "${venv.path}"`,
    `python -m venv "${venv.path}"`,
    // `python -m virtualenv ${venvPath}`,
    `"${venv.pythonPath}" -m pip install --upgrade pip`,
    `"${venv.pipPath}" install -r "${tempRequirementPath}"`,
    `del "${tempRequirementPath}"`,
    `echo "Finished recreating venv"`,
  ];

  const defaultTerminal = vscode.env.shell;
  const isPowershell = defaultTerminal.includes("powershell");
  const commands = isPowershell
    ? baseCommands.map(command => `cmd.exe /c '${command.replaceAll("'", "''")}'`)
    : baseCommands;
  return commands;
}

function getTerminal(terminalName, index) {
  const existingTerminal = vscode.window.terminals.filter(
    terminal => terminal.name === terminalName
  )[index];
  const terminal = existingTerminal ? existingTerminal : vscode.window.createTerminal(terminalName);
  return terminal;
}

module.exports = recreateVenvs;
