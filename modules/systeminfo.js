const os = require('os');
const fs = require('fs');
const execSync = require('child_process').execSync;
const axios = require('axios');
const { DirectoryPath } = require('../index.js');

const username = execSync('whoami').toString().trim();

const publicIp = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://ip-api.com/json/')
      .then(response => {
        if (response.data.status === 'success') {
          const publicIpData = {
            publicIpResult: response.data.query,
            city: response.data.city,
            state: response.data.region,
            country: response.data.country,
            lat: response.data.lat,
            lon: response.data.lon,
            timezone: response.data.timezone,
            isp: response.data.isp
          };
          resolve(publicIpData);
        } else {
          reject(new Error('Failed to retrieve data from IP API'));
        }
      })
      .catch(error => {
        console.error('Error fetching public IP:', error);
        reject(error);
      });
  });
};

publicIp().then(publicIpData => {
  const cpuModel = execSync('wmic cpu get name').toString().split('\n')[1].trim();
  const gpuModel = execSync('wmic path win32_VideoController get name').toString().split('\n')[1].trim();
  const freeRam = os.freemem();
  const totalRam = os.totalmem();
  const RamUsedInGB = ((totalRam - freeRam) / (1024 * 1024 * 1024)).toFixed(2);
  const ramInGB = (totalRam / (1024 * 1024 * 1024)).toFixed(2);

  const sysInfo = `Active Username: ${username}
Public Facing IP: ${publicIpData.publicIpResult}
City: ${publicIpData.city}
State: ${publicIpData.state}
Country: ${publicIpData.country}
Latitude: ${publicIpData.lat}
Longitude: ${publicIpData.lon}
Timezone: ${publicIpData.timezone}
ISP: ${publicIpData.isp}
CPU Model: ${cpuModel}
GPU Model: ${gpuModel}
Used RAM: ${RamUsedInGB} GB
Total RAM: ${ramInGB} GB`;

  fs.writeFile(`${DirectoryPath}/SysInfo.txt`, sysInfo, (err) => {
    if (err) throw err;
    console.log('System Information has been saved to SysInfo.txt');
  });
}).catch(error => {
  console.error('Error fetching public IP:', error);
});
