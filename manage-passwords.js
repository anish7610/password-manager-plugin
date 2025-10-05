import { openIndexedDB } from "./dbService.js";

document.addEventListener("DOMContentLoaded", function() {
    const addPasswordButton = document.getElementById("addPassword");
    const closeButton = document.getElementById("closeButton");
    const addPasswordForm = document.getElementById("addPasswordForm");
    const passwordList = document.getElementById("password-list");

    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');

    // display all passwords on page load
    displayPasswords(username);

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
    
        storePassword(username, siteUsername, password, website).then((passwords) => {
            // alert(passwords);
        }).catch((error) => {
            console.error(error);
        })
    })

    function storePassword(username, siteUsername, password, website) {
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {          
                const transaction = db.transaction(['passwords'], 'readwrite');
                const objectStore = transaction.objectStore('passwords');
                const addRequest = objectStore.add({username: username, siteUsername: siteUsername, password: password, website: website});

                addRequest.onsuccess = function(event) {
                    displayPasswords(username).then((result) => {
                        resolve(result);
                    })
                }

                addRequest.onerror = function(event) {
                    reject('Error adding password to database', event.target.errorCode);
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }


    function updatePassword(id, username, siteUsername, password, website) {
        return new Promise((resolve, reject) => {
            openIndexedDB().then((db) => {
                const transaction = db.transaction(['passwords'], 'readwrite');
                const objectStore = transaction.objectStore('passwords');
                const getRequest = objectStore.get(parseInt(id));

                getRequest.onsuccess = function(event) {
                    // Modify the data
                    var data = event.target.result;

                    if (data) {
                        data.siteUsername = siteUsername;
                        data.password = password;
                        data.website = website;
                        data.username = username;
 
                        var putRequest = objectStore.put(data);
    
                        putRequest.onerror = function(event) {
                            console.log('Error updating record: ' + event.target.errorCode);
                        };
    
                        putRequest.onsuccess = function(event) {
                            // console.log('Record updated successfully');
                            window.location.href = 'view_passwords.html?username=' + encodeURIComponent(username);
                        };
                    }
                }
            }).catch((error) => {
                alert(error);
            });
        });
    }

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

                            const domain = password.website.split("www.")[1];
                            link.textContent = domain.charAt(0).toUpperCase() +  domain.slice(1, -4);

                            listItem.append(link);
                            
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
                                    console.log("close button");
                                    editForm.style.display = 'none';
                                })

                                const editSiteUsername = editForm.querySelector('#siteUsername');
                                const editPassword = editForm.querySelector('#password');
                                const editWebsite = editForm.querySelector('#website');

                                editSiteUsername.value = password.siteUsername;
                                editPassword.value = password.password;
                                editWebsite.value = password.website;
                                
                                listItem.appendChild(editForm);

                                editForm.addEventListener('submit', function() {
                                    console.log('edit submit');
                                    const id = editForm.getAttribute('id');
                                    const username = editForm.getAttribute('username');
                                    const siteUsername = editForm.querySelector('#siteUsername').value;
                                    const password = editForm.querySelector('#password').value;
                                    const website = editForm.querySelector('#website').value;
                                    updatePassword(id, username, siteUsername, password, website);
                                });
                            }

                            deletePasswordButton.onclick = function() {
                                const transaction = db.transaction(['passwords'], 'readwrite');
                                const objectStore = transaction.objectStore('passwords');
                                objectStore.delete(password.id);
                                displayPasswords(username);
                            }

                            listItem.appendChild(deletePasswordButton);
                            listItem.appendChild(editPasswordButton);
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
});