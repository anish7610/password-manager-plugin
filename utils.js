import { getUserAccount, getAllPasswords, addPassword } from "./dbService.js";

export function generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12)); // Using 12 bytes for AES-GCM
}

export function generateSalt() {
    return  window.crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKeyFromPassword(password, salt, iterations, keyLength) {
    const encodedPassword = new TextEncoder().encode(password);
    const derivedKey = await window.crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const key = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: { name: 'SHA-256' },
        },
        derivedKey,
        keyLength * 8
    );
    return key;
}
    

// Function to encrypt a password using the generated encryption key
export async function encryptPassword(password, keyMaterial, iv) {
    // Import the derived key material
    const encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const encodedPassword = new TextEncoder().encode(password);
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        encryptionKey,
        encodedPassword
    );
    return encryptedData;
}

// Function to decrypt an encrypted password using the encryption key
export async function decryptPassword(encryptedPassword, keyMaterial, iv) {
    const encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv, // Use the same IV as used for encryption
        },
        encryptionKey,
        encryptedPassword
    );
    return new TextDecoder().decode(decryptedData);
}

// Function to hash a password using SHA-256
export async function hashPassword(password) {
    const encodedPassword = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedPassword);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function generatePassword(passwordLength = 12) {
    // Define character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numericChars = '0123456789';
    const specialChars = '!@#$%^&*()-_+=~`[]{}|:;"\'<>,.?/';

    // Combine character sets
    const allChars = uppercaseChars + lowercaseChars + numericChars + specialChars;

    let password = '';

    // Generate random password
    for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    const generatedPassword = document.getElementById('generatedPassword');
    generatedPassword.innerHTML = '<h2>Generated Password: </h2>';
    console.log(password);
    generatedPassword.innerHTML += password;
}

export function encryptSitePassword(username, password) {
    return new Promise((resolve, reject) => {
        getUserAccount(username).then((userAccount) => {
            encryptPassword(password, userAccount.derivedKey, userAccount.iv).then((encryptedPassword) => {
                resolve(encryptedPassword);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

export function decryptSitePassword(username, password) {
    return new Promise((resolve, reject) => {
        getUserAccount(username).then((userAccount) => {
            decryptPassword(password, userAccount.derivedKey, userAccount.iv).then((decryptedPassword) => {
                resolve(decryptedPassword);
            }).catch((error) => {
                reject(error);
            });

        }).catch((error) => {
            reject(error);
        });
    });
}

export function importPasswords(file) {
    const reader = new FileReader(); 
    reader.readAsText(file);

    reader.onload = function(event) {
        const csvData = event.target.result;
        
        //split and get the rows in an array
        var rows = csvData.split('\n');
        let cols;

        chrome.storage.local.get('username', function(result){
            if (result) {
                for (var i = 1; i < rows.length - 1; i++) {
                    //split by separator (,) and get the columns
                    cols = rows[i].split(',');
                    if (cols[0] != result.username) {
                        cols[0] = result.username;
                    }

                    addPassword(cols[0], cols[1], cols[2], cols[3]).then(() => {

                    }).catch((error) => {
                        document.getElementById("fileImportSuccessfulMessage").textContent = error;
                    });
                }
                document.getElementById("fileImportSuccessfulMessage").textContent = "Passwords imported successfully";
            }
        });
    }
}


export async function exportPasswords(filename) {
    chrome.storage.local.get('username', function(result){
        if (result) {
            getAllPasswords(result.username).then(passwords => {
                Promise.all(passwords.map(password => decryptSitePassword(password.username, password.password))).then((decryptedPasswords) => {
                    passwords.forEach((password, index) => {
                        password.password = decryptedPasswords[index];
                        delete password.id;
                    });
                    downloadCSV(filename + ".csv", ['username', 'siteUsername', 'password', 'website'], passwords);
                });
            });
        }
    });
}

function downloadCSV(filename, headers, data) {
    // Prepend headers to the data
    var csv = headers.join(',') + '\n';
    // Convert data array to a CSV string
    data.forEach(function(obj) {
        var values = Object.values(obj);
        csv += values.join(',') + '\n';
    });

    // Create a data URI for the CSV content
    var encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    var downloadFileLink = document.getElementById("exportedFile");

    toggleVisibility(document.getElementById('spanText'));
    downloadFileLink.setAttribute("href", encodedUri);
    downloadFileLink.setAttribute('download', filename);
    downloadFileLink.innerText = filename;
}

export function copyToClipboard(textToCopy) {
    // Create a temporary textarea element
    var tempTextarea = document.createElement("textarea");
    tempTextarea.value = textToCopy;

    // Append the textarea element to the document body
    document.body.appendChild(tempTextarea);

    // Select the text inside the textarea
    tempTextarea.select();

    // Copy the selected text to the clipboard
    document.execCommand("copy");

    // Remove the temporary textarea element
    document.body.removeChild(tempTextarea);
}

export function toggleVisibility(element) {
    if (element.style.display == "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}