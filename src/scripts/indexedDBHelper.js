const DB_NAME = 'MyDatabase';
const DB_VERSION = 1;
const STORE_NAME = 'AppStore';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('IndexedDB error');
    };
  });
}

async function getDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get('data');

    request.onsuccess = () => {
      resolve(request.result || {});
    };

    request.onerror = () => {
      reject('Error fetching data');
    };
  });
}

async function setDB(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(data, 'data');

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Error saving data');
    };
  });
}

async function resetDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Error clearing data');
    };
  });
}

export { getDB, setDB, resetDB };
