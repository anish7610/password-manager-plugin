import { openIndexedDB } from "./dbService.js";

document.addEventListener("DOMContentLoaded", function() {
    const loginForm =  document.getElementById('loginForm');
    const createAccountButton = document.getElementById('createAccount');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit',  function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        // Retrieve encrypted password from IndexedDB
        getPasswordFromIndexedDB(username).then((result) => {
            // alert(result);
            if (result) {
                if (password === result.password) {
                    window.location.href = 'view_passwords.html?username=' + encodeURIComponent(result.username);
                } else {
                    errorMessage.textContent = "Invalid Credentials";
                }
            } else {
                errorMessage.textContent = "User Not Found";
            }

        }).catch((error) => {
            alert("Error: " + error);
        })
    });
    
    function getPasswordFromIndexedDB(username) {
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {
                const transaction = db.transaction("userAccounts", "readonly");
                const objectStore = transaction.objectStore("userAccounts");
        
                const getRequest = objectStore.get(username);
                
                getRequest.onsuccess = function(event) {
                    resolve(event.target.result);
                }

                getRequest.onerror = function(event) {
                    reject("Async fetch get operation failed", error);
                }
               }).catch((error) => {
                    // DB open error
                    reject(error);
               });
        });
    }

    createAccountButton.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = 'create_account.html'
    });
});