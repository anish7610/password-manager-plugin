let dbInstance = null;

export function openIndexedDB() {
    if (!dbInstance) {
        const request = indexedDB.open('plugindb', 1);
        dbInstance = new Promise((resolve, reject) => {
            
            request.onerror = () => reject('Error opening database');
            
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                console.log("upgrade called");
                const db = event.target.result;
                const objectStore = db.createObjectStore("userAccounts", { keyPath: "username"})
                resolve(db);
            };
        });
    }
    return dbInstance;
}


