const dbName = 'iconManagerDB';
const storeName = 'icons';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'packageName' });
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function setAppIcon(packageName, svgCode) {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
    const iconData = { packageName, blob: svgBlob };
    store.put(iconData);
}

async function getAppIcon(packageName) {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.get(packageName);
        request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {
                const url = URL.createObjectURL(result.blob);
                resolve(url);
            } else {
                resolve(null);
            }
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export { setAppIcon, getAppIcon };
