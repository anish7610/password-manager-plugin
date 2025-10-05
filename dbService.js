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
