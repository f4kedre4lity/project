const fs = require('fs');
const path = require('path');
const { DirectoryPath } = require('../index.js');
const screenshot = require('screenshot-desktop');

const outputDir = path.join(DirectoryPath, 'Images');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

screenshot.all({ format: 'png' })
    .then((imgs) => {
        imgs.forEach((img, index) => {
            const filePath = path.join(outputDir, `screenshot-${index + 1}.png`);
            fs.writeFileSync(filePath, img);
            console.log(`Screenshot saved to ${filePath}`);
        });
    })
    .catch((err) => {
        console.error('Error capturing screens:', err);
    });