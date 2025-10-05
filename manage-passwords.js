import { decryptSitePassword } from "./utils.js";
import { openIndexedDB, getPassword, addPassword, updatePassword } from "./dbService.js";

document.addEventListener("DOMContentLoaded", function() {
    const addPasswordButton = document.getElementById("addPassword");
    const closeButton = document.getElementById("closeButton");
    const addPasswordForm = document.getElementById("addPasswordForm");
    const passwordList = document.getElementById("password-list");

    let username;

    chrome.storage.local.get('isLoggedIn', function(result){
        if (!result.isLoggedIn) {
                window.location.href = 'login.html';
        } else {
            chrome.storage.local.get('username', function(result){
                if (result.username) {
                    // display all passwords on page load
                    username = result.username;
                    displayPasswords(username);
                }
            });
        }
    });

    // open addPasswordForm on add button click
    addPasswordButton.addEventListener('click', function(event) {
        event.preventDefault();
        toggleFormVisibility();
    });

    // close addPasswordForm on add button click
    closeButton.addEventListener('click', function(event) {
        event.preventDefault();
        toggleFormVisibility();
    });

    // save password to indexDB
    addPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const siteUsername = document.getElementById("siteUsername").value;
        const password = document.getElementById("password").value;
        const website = document.getElementById("website").value;  
    
        addPassword(username, siteUsername, password, website).then(() => {
            displayPasswords(username);
        }).catch((error) => {
            console.error(error);
        })
    });


    function displayPasswords(username) {
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {
                const transaction = db.transaction(['passwords'], 'readonly');
                const objectStore = transaction.objectStore('passwords');
                const index = objectStore.index('username');
                const range = IDBKeyRange.only(username);

                const passwords = [];

                index.openCursor(range).onsuccess = function(event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        passwords.push(cursor.value);
                        cursor.continue();
                    } else {
                        // resolve(passwords);
                        // Loop through each child element and remove it
                        while (passwordList.firstChild) {
                            passwordList.removeChild(passwordList.firstChild);
                        }

                        passwords.forEach(function(password) {
                            const listItem = document.createElement('li');
                            const listItemId = password.id;
                            listItem.setAttribute('id', listItemId);

                            var link = document.createElement('a');
                            link.href = password.website;
                            link.textContent = password.website;

                            listItem.append(link);

                            const autoFillButton = document.createElement('button');
                            autoFillButton.textContent = 'AutoFill';
                            autoFillButton.setAttribute('id', password.id);
                            
                            const editPasswordButton = document.createElement('button');
                            editPasswordButton.textContent = 'Edit';

                            const deletePasswordButton = document.createElement('button');
                            deletePasswordButton.textContent = 'Delete';

                            editPasswordButton.onclick = function() {
                                var editForm = addPasswordForm.cloneNode(true);
                                editForm.style.display = 'block';
                                editForm.setAttribute('username', password.username);
                                editForm.setAttribute('id', password.id);

                                var closeButton = editForm.querySelector('#closeButton');

                                closeButton.addEventListener('click', function(event) {
                                    event.preventDefault();
                                    editForm.style.display = 'none';
                                });

                                const editSiteUsername = editForm.querySelector('#siteUsername');
                                const editPassword = editForm.querySelector('#password');
                                const editWebsite = editForm.querySelector('#website');

                                editSiteUsername.value = password.siteUsername;
                                editWebsite.value = password.website;

                                decryptSitePassword(password.username, password.password).then((decryptedPassword) => {
                                    editPassword.value = decryptedPassword;
                                });

                                listItem.appendChild(editForm);

                                editForm.addEventListener('submit', function() {
                                    event.preventDefault();
                                    const id = editForm.getAttribute('id');
                                    const username = editForm.getAttribute('username');
                                    const siteUsername = editForm.querySelector('#siteUsername').value;
                                    const password = editForm.querySelector('#password').value;
                                    const website = editForm.querySelector('#website').value;
                                    updatePassword(id, username, siteUsername, password, website).then(function() {
                                        location.reload();
                                    });
                                });
                            }

                            autoFillButton.onclick = function() {
                                const passwordId = autoFillButton.getAttribute('id');

                                getPassword(parseInt(passwordId)).then((password) => {
                                    decryptSitePassword(password.username, password.password).then((decryptedPassword) => {
                                        // alert(decryptedPassword);
                                        sendMessageToContentScript(password.siteUsername, decryptedPassword);
                                    });
                                });
                            };

                            deletePasswordButton.onclick = function() {
                                const transaction = db.transaction(['passwords'], 'readwrite');
                                const objectStore = transaction.objectStore('passwords');
                                var delRequest = objectStore.delete(password.id);

                                delRequest.onerror = function(event) {
                                    console.error("Failed to delete password");
                                }

                                delRequest.onsuccess = function(event) {
                                    location.reload();
                                }

                            }

                            listItem.appendChild(deletePasswordButton);
                            listItem.appendChild(editPasswordButton);
                            listItem.appendChild(autoFillButton);
                            passwordList.appendChild(listItem);
                        });

                    }
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    function toggleFormVisibility() {
        var form = document.getElementById('addPasswordForm');
        if (form.classList.contains("hidden")) {
            form.classList.remove("hidden");
        } else {
            form.classList.add("hidden")
        }
    }

    // Function to send a message to the content script with arguments
    function sendMessageToContentScript(username, password) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: 'autofill', username: username, password: password, title: activeTab.title});
        });
    }
});