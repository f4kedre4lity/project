const NodeWebcam = require('node-webcam');
const fs = require('fs');
const path = require('path');
const { DirectoryPath } = require('../index.js'); // Import DirectoryPath

// Create the output directory if it does not exist
if (!fs.existsSync(`${DirectoryPath}/Images`)) {
    fs.mkdirSync(`${DirectoryPath}/Images`, { recursive: true });
}

// Function to capture an image from a webcam
function captureImage(callback) {
    // Set up the webcam options
    const webcamOptions = {
        width: 1920,
        height: 1080,
        quality: 100,
        delay: 0,
        saveShots: true,  // Save shots directly instead of returning buffer
        output: 'jpeg',
        device: false,
        callbackReturn: 'location',
        verbose: false
    };

    // Create a new NodeWebcam instance
    const webcamInstance = NodeWebcam.create(webcamOptions);

    // File path to save the captured image
    const filePath = path.join(`${DirectoryPath}/Images`, 'webcam');

    // Capture an image
    webcamInstance.capture(filePath, (err, data) => {
        if (err) {
            console.error(`Error capturing image from webcam: `, err);
            return callback(err);
        }

        const savedFilePath = `${filePath}.jpg`;
        console.log(`Image from webcam saved to ${savedFilePath}`);
        callback(null);
    });
}

// Function to attempt capturing an image from the primary webcam
function capturePrimaryWebcam() {
    captureImage((err) => {
        if (err) {
            console.error('Failed to capture image from the primary webcam:', err);
        } else {
            console.log('Successfully captured image from the primary webcam.');
        }
        process.exit(0); // Ensure the script exits properly
    });
}

// Run the capturePrimaryWebcam function
capturePrimaryWebcam();
