// imageStore.js

const dbName = 'imageStoreDB';
const storeName = 'images';

// Open or create the database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName, { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save an image to IndexedDB
async function saveImage(id, image) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.put({ id, image });

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// Get an image from IndexedDB
async function loadImage(id) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.image : null);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function hasImage(id) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result !== undefined);
    request.onerror = (event) => reject(event.target.error);
  });
}
async function removeImage(id) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.delete(id);

  await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}
const imageStore = {
  saveImage,
  loadImage,
  hasImage,
  removeImage
}
export { saveImage, loadImage, hasImage, removeImage };
export default imageStore;