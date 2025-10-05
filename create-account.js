import {openIndexedDB} from "./dbService.js";

document.addEventListener("DOMContentLoaded", function() {
    const createAccountForm = document.getElementById('createAccountForm');
    const errorMessage = document.getElementById('errorMessage');

    createAccountForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Encrypt sensitive user information
        // const encryptedPassword = encryptData(password);

        // Save encrypted user information to IndexedDB
        saveToIndexedDB(username, password).then((result) => {
            window.location.href = "login.html";
        }).catch((error) => {
            alert(error);
        })
    });

    function saveToIndexedDB(name, encryptedPassword) {
        // Open or create IndexedDB database
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {
                // Store encrypted user information in database
                const transaction = db.transaction(['userAccounts'], 'readwrite');
                const objectStore = transaction.objectStore('userAccounts');
                const addRequest = objectStore.add({ username: name, password: encryptedPassword });
    
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