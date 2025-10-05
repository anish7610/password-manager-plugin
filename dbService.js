import { encryptSitePassword } from "./utils.js";

let dbInstance = null;

export function openIndexedDB() {
    if (!dbInstance) {
        const request = indexedDB.open('plugindb', 1);
        dbInstance = new Promise((resolve, reject) => {
            
            request.onerror = (event) => {
                if (request.error && request.error.name === 'InvalidStateError') {
                    event.preventDefault();
                }
            }
            
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const userStore = db.createObjectStore("userAccounts", { keyPath: "username"})
                const passwordStore = db.createObjectStore("passwords", { keyPath: "id", autoIncrement: true});
                passwordStore.createIndex("password", "password");
                passwordStore.createIndex("username", "username");
                passwordStore.createIndex("uniqueWebsite", ["username", "website"], {unique: true});
            };
        });
    }
    return dbInstance;
}

export function getUserAccount(username) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            const transaction = db.transaction(['userAccounts'], 'readonly');
            const objectStore = transaction.objectStore('userAccounts');

            const getRequest = objectStore.get(username);

            getRequest.onsuccess = function(event) {
                resolve(event.target.result);
            }

            getRequest.onerror = function(event) {
                reject('Error adding password to database ');
            }
        }).catch((error) => {
            reject(error);
        });
    });
}

export function getAllPasswords(username) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            const transaction = db.transaction(['passwords'], 'readonly');
            const objectStore = transaction.objectStore('passwords');
            const index = objectStore.index('username');
            const getRequest = index.getAll(username);

            getRequest.onsuccess = function(event) {
                var records = event.target.result
                resolve(records);
            }

            getRequest.onerror = function(event) {
                reject('Error adding password to database', event.target.errorCode);
            }
        }).catch((error) => {
            reject(error);
        });
    });
}

export function getPassword(passwordId) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            const transaction = db.transaction(['passwords'], 'readonly');
            const objectStore = transaction.objectStore('passwords');

            const getRequest = objectStore.get(passwordId);

            getRequest.onsuccess = function(event) {
                resolve(event.target.result);
            }

            getRequest.onerror = function(event) {
                reject('Error adding password to database', event.target.errorCode);
            }
        }).catch((error) => {
            reject(error);
        });
    });
}

export function addPassword(username, siteUsername, password, website) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            encryptSitePassword(username, password).then((encryptedPassword) => {
                const transaction = db.transaction(['passwords'], 'readwrite');
                const objectStore = transaction.objectStore('passwords');
                const addRequest = objectStore.add({username: username, siteUsername: siteUsername, password: encryptedPassword, website: website});

                addRequest.onsuccess = function(event) {
                    resolve();
                }

                addRequest.onerror = function(event) {
                    reject('Error adding password to database');
                }
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

export function updatePassword(id, username, siteUsername, password, website) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            const transaction = db.transaction(['passwords'], 'readwrite');
            const objectStore = transaction.objectStore('passwords');
            const getRequest = objectStore.get(parseInt(id));

            getRequest.onsuccess = function(event) {
                // Modify the data
                var data = event.target.result;

                if (data) {
                    encryptSitePassword(username, password).then((encryptedPassword) => {
                        data.siteUsername = siteUsername;
                        data.password = encryptedPassword;
                        data.website = website;
                        data.username = username;

                        const transaction = db.transaction(['passwords'], 'readwrite');
                        const objectStore = transaction.objectStore('passwords');
                        var putRequest = objectStore.put(data);

                        putRequest.onerror = function(event) {
                            console.log('Error updating record: ' + event.target.errorCode);
                        };

                        putRequest.onsuccess = function(event) {
                            // console.log('Record updated successfully');
                            resolve();
                        };
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }
        }).catch((error) => {
            alert(error);
        });
    });
}

export function deletePassword(passwordId) {
    return new Promise((resolve, reject) => {
        openIndexedDB().then((db) => {
            const transaction = db.transaction(['passwords'], 'readwrite');
            const objectStore = transaction.objectStore('passwords');
            var delRequest = objectStore.delete(passwordId);

            delRequest.onerror = function(event) {
                reject("Failed to delete password");
            }

            delRequest.onsuccess = function(event) {
                resolve();
            }
        });
    });
}