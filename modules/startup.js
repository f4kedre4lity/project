// currently broken, might restructure this later


// const path = require('path');
// const fs = require('fs');
// 
// // Get the current script's path
// const startupFile = path.resolve(__filename);
// 
// // Get the directory of the current script
// const startupDir = path.dirname(startupFile);
// 
// // Define the Windows startup directory
// const startupDirectory = 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup';
// 
// // Function to check if the file already exists in the startup directory
// function fileExistsInStartup(filename) {
  // const startupPath = path.join(startupDirectory, filename);
  // return fs.existsSync(startupPath);
// }
// 
// // Function to add the startup file to the startup directory
// function addToStartup() {
  // const startupPath = path.join(startupDirectory, path.basename(startupFile));
  // if (!fileExistsInStartup(path.basename(startupFile))) {
    // fs.copyFileSync(startupFile, startupPath);
    // console.log('Successfully added to startup');
  // } else {
    // console.log('Already exists in startup');
  // }
// }
// 
// // Print the running directory
// console.log('Running from:', startupDir);
// 
// // Add the script to the startup directory
// addToStartup();