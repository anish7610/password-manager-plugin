let dbInstance = null;

export function openIndexedDB() {
    if (!dbInstance) {
        const request = indexedDB.open('plugindb', 1);
        dbInstance = new Promise((resolve, reject) => {
            
            request.onerror = (event) => {
                alert(event.target.error);
            }
            
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const userStore = db.createObjectStore("userAccounts", { keyPath: "username"})
                const passwordStore = db.createObjectStore("passwords", { keyPath: "id", autoIncrement: true});
                passwordStore.createIndex("password", "password");
                passwordStore.createIndex("username", "username");
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
                reject('Error adding password to database', event.target.errorCode);
            }
        }).catch((error) => {
            reject(error);
        });
    });
}
