class StyleManager {
    constructor() {
        this.localStorageKey = 'styleManagerMetadata';
        this.dbName = 'StyleManagerDB';
        this.dbVersion = 1;
        this.storeName = 'styles';
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }
    async installStyle(styleText, id = Math.random().toString(36).substr(2, 9) + "_" + Math.random().toString(36).substr(2, 9)) {

                // Save to IndexedDB
                const db = await this.initDB();
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                await store.put({
                    id,
                    content: styleText
                });

                const metadata = this.getMetadata();

                // Regular expressions to extract metadata
                const titleMatch = styleText.match(/\/\* title: (.*?) \*\//);
                const authorMatch = styleText.match(/\/\* author: (.*?) \*\//);
                const iconMatch = styleText.match(/\/\* icon: (.*?) \*\//);
                const descriptionMatch = styleText.match(/\/\* description: (.*?) \*\//);

                metadata[id] = {
                    title: titleMatch ? titleMatch[1] : 'No title',
                    author: authorMatch ? authorMatch[1] : 'No author',
                    icon: iconMatch ? iconMatch[1] : 'No icon',
                    description: descriptionMatch ? descriptionMatch[1] : 'No description',
                };

                localStorage.setItem(this.localStorageKey, JSON.stringify(metadata));

    }
    async downloadStyle(url, id = Math.random().toString(36).substr(2, 9) + "_" + Math.random().toString(36).substr(2, 9)) {
            try {
                const response = await fetch(url);
                const cssContent = await response.text();
                await this.installStyle(cssContent, id);
                return cssContent;
            } catch (error) {
                console.error('Error downloading style:', error);
                throw error;
            }
        }

        getMetadata() {
            const stored = localStorage.getItem(this.localStorageKey);
            return stored ? JSON.parse(stored) : {};
        }

    async getStyle(id) {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

    async applyStyle(id) {
            const style = await this.getStyle(id);
            if (style) {
                const styleElement = document.createElement('style');
                styleElement.textContent = style.content;
                document.head.appendChild(styleElement);
                return true;
            }
            return false;
        }

    async removeStyle(id) {
            const db = await this.initDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            await store.delete(id);

            const metadata = this.getMetadata();
            delete metadata[id];
            localStorage.setItem(this.localStorageKey, JSON.stringify(metadata));
        }
    }

// Usage example:
// const styleManager = new StyleManager();
// await styleManager.downloadStyle('https://example.com/styles.css', 'theme1');
// await styleManager.applyStyle('theme1');
export default StyleManager