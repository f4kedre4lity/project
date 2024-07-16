const NodeWebcam = require('node-webcam');
const fs = require('fs');
const { DirectoryPath } = require('../index.js')
const path = require('path');

fs.mkdir(path.join(DirectoryPath, "Images"), {recursive: true}, (err) => {
  if (err) {
      console.error('Error creating directory: ', err);
  } else {
      console.log('Directory created successfully: ');
  }
})

const opts = {
  width: 1920,
  height: 1080,
  quality: 100,
  delay: 0,
  output: 'jpg',
  device: false,
  callbackReturn: 'location',
  verbose: false
};

const Webcam = NodeWebcam.create(opts);

Webcam.capture('WebCam', function(err, filepath) {
  if (err) {
    console.error(err);
  } else {
    fs.rename(filepath, `${DirectoryPath}/Images/webcam.jpg`, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Webcam Image saved to webcam.jpg`);
      }
    });
  }
});


const screenshot = require('screenshot-desktop');

screenshot().then((img) => {
  fs.writeFileSync(`${DirectoryPath}/Images/screenshot.png`, img);
  console.log('Desktop screenshot saved to screenshot.png');
}).catch((err) => {
  console.error(err);
});