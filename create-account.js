import { openIndexedDB } from "./dbService.js";
import { hashPassword, deriveKeyFromPassword, generateSalt, generateIV } from "./cryptoUtils.js";


document.addEventListener("DOMContentLoaded", function() {
    const createAccountForm = document.getElementById('createAccountForm');
    const errorMessage = document.getElementById('errorMessage');

    createAccountForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const masterPassword = document.getElementById('password').value;

        const iv = generateIV();
        const salt = generateSalt();
        const iterations = 10000;
        const keylength = 32;

        deriveKeyFromPassword(masterPassword, salt, iterations, keylength).then((derivedKey) => {
            hashPassword(masterPassword).then((hashedMasterPassword) => {
                // alert(derivedKey);
                saveToIndexedDB(username, hashedMasterPassword, derivedKey, iv).then(() => {
                    window.location.href = "login.html";
                }).catch((error) => {
                    alert(error);
                });
            }).catch((error) => {
                alert(error);
            });
        });
        });

    function saveToIndexedDB(username, hashedMasterPassword, derivedKey, iv) {
        // Open or create IndexedDB database
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {
                // Store encrypted user information in database
                const transaction = db.transaction(['userAccounts'], 'readwrite');
                const objectStore = transaction.objectStore('userAccounts');
                const addRequest = objectStore.add({ username: username, password: hashedMasterPassword, derivedKey: derivedKey, iv: iv});
    
                addRequest.onsuccess = function(event) {
                    // alert('Account created and saved to database');
                    resolve();
                };
    
                addRequest.onerror = function(event) {
                    reject('Error adding account to database');
                };
            }).catch((error) => {
                reject(error);
            });
        });
    }
});