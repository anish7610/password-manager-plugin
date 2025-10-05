import { getUserAccount, openIndexedDB } from "./dbService.js";
import { hashPassword } from "./cryptoUtils.js";

document.addEventListener("DOMContentLoaded", function() {
    const loginForm =  document.getElementById('loginForm');
    const createAccountButton = document.getElementById('createAccount');
    const errorMessage = document.getElementById('errorMessage');

    chrome.storage.local.get('isLoggedIn', function(result){
        if (result.isLoggedIn) {
                window.location.href = 'view_passwords.html';
        }
    });

    loginForm.addEventListener('submit',  function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        // Retrieve encrypted password from IndexedDB
        getUserAccount(username).then((userAccount) => {
            // alert(result);
            if (userAccount) {
                hashPassword(password).then((hashedPassword) => {
                    if (hashedPassword === userAccount.password) {
                        chrome.storage.local.set({isLoggedIn: true, username: username});
                        window.location.href = 'view_passwords.html?username=' + encodeURIComponent(userAccount.username);
                    } else {
                        errorMessage.textContent = "Invalid Credentials";
                    }
                }).catch((error) => {
                    alert(error);
                });
            } else {
                errorMessage.textContent = "User Not Found";
            }

        }).catch((error) => {
            alert("Error: " + error);
        })
    });

    createAccountButton.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = 'create_account.html'
    });
});