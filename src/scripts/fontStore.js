const dbName = 'FontDB';
const storeName = 'fonts';
const localStorageKey = 'customFontName';

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveFont(fontName, fontData) {
  const db = await this.initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(fontData, fontName);

    request.onsuccess = () => {
      localStorage.setItem(localStorageKey, fontName);
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

async function loadFont() {
  const fontName = localStorage.getItem(localStorageKey);
  if (!fontName) return null;

  const db = await this.initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(fontName);

    request.onsuccess = (event) => {
      const fontData = event.target.result;
      if (fontData) {
        // Revoke previous font URL if exists
        if (window.lastFontURL) {
          URL.revokeObjectURL(window.lastFontURL);
        }

        const blob = new Blob([fontData], { type: 'font/ttf' });
        const fontUrl = URL.createObjectURL(blob);

        // Save the new font URL to window.lastFontURL
        window.lastFontURL = fontUrl;

        // Create and inject @font-face rule
        const fontFace = new FontFace('CustomFont', `url(${fontUrl})`);
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          document.body.style.fontFamily = 'CustomFont';
        });
      }
      resolve(event.target.result);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

async function clearFont() {
  const fontName = localStorage.getItem(localStorageKey);
  if (!fontName) return;
  localStorage.removeItem("font")
  const db = await this.initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(fontName);

    request.onsuccess = () => {
      localStorage.removeItem(localStorageKey);

      // Revoke current Blob URL if exists
      if (window.lastFontURL) {
        URL.revokeObjectURL(window.lastFontURL);
        window.lastFontURL = null;
      }

      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

async function hasFont() {
  const fontName = localStorage.getItem(localStorageKey);
  if (!fontName) return false;

  const db = await this.initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(fontName);

    request.onsuccess = (event) => resolve(!!event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

const fontStore = { initDB, saveFont, loadFont, hasFont, clearFont }

export { initDB, saveFont, loadFont, hasFont, clearFont }
export default fontStore;