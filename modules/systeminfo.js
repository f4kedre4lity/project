const os = require('os');
const fs = require('fs');
const execSync = require('child_process').execSync;
const axios = require('axios');
const { DirectoryPath } = require('../index.js')

const username = execSync('whoami').toString()

const publicIp = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://api.ipify.org')
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error fetching public IP:', error);
        reject(error);
      });
  });
};
// i really dont know how the FUCK this works
// go fuck yourself if you can do better
publicIp().then(publicIpResult => {
  const cpuModel = execSync('wmic cpu get name').toString().split('\n')[1].trim();
  const gpuModel = execSync('wmic path win32_VideoController get name').toString().split('\n')[1];
  const freeRam = os.freemem();
  const totalRam = os.totalmem();
  const RamUsedInGB = ((totalRam - freeRam) / (1024 * 1024 * 1024)).toFixed(2);
  const ramInGB = (totalRam / (1024 * 1024 * 1024)).toFixed(2);

  const sysInfo = `Active Username: ${username}
Public Facing IP: ${publicIpResult}
CPU Model: ${cpuModel}
GPU Model: ${gpuModel}
Used RAM: ${RamUsedInGB} GB
Total RAM: ${ramInGB} GB`;
//🧑‍🍳🤌

  fs.writeFile(`${DirectoryPath}/SysInfo.txt`, sysInfo, (err) => {
    if (err) throw err;
    console.log('System Information has been saved to SysInfo.txt');
  });
}).catch(error => {
  console.error('Error fetching public IP:', error);
});