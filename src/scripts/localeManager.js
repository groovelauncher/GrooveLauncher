import * as ITL from "isotolanguage";
import JSON5 from 'json5';
window.ITL = ITL;
class Locale {
  constructor(locale) {
    this.locale = locale;
  }
}
const files = ["colors", "common", "readme", "settings", "welcome"]
function remoteFiles(locale = "en-US") {
  const mainURL = `https://raw.githubusercontent.com/groovelauncher/GrooveLauncherLocalization/refs/heads/main/languages/${locale}`
  return Object.fromEntries(files.map(file => [file, `${mainURL}/${file}.json`]))
}
const localeNames = {
  "key": { name: "DebugKey", nativeName: "DebugKey" },
  "index": { name: "DebugIndex", nativeName: "DebugIndex" },
  "ar": { name: "Arabic", nativeName: "العربية" },
  "az": { name: "Azerbaijani", nativeName: "Azərbaycan Dili" },
  "bg": { name: "Bulgarian", nativeName: "Български" },
  "bs": { name: "Bosnian", nativeName: "Bosanski" },
  "zh-CN": { name: "Chinese (Simplified)", nativeName: "中文 (简体)" },
  "zh-TW": { name: "Chinese (Traditional)", nativeName: "中文 (繁體)" },
  "cs": { name: "Czech", nativeName: "Čeština" },
  "da": { name: "Danish", nativeName: "Dansk" },
  "nl": { name: "Dutch", nativeName: "Nederlands" },
  "fi": { name: "Finnish", nativeName: "Suomi" },
  "fr": { name: "French", nativeName: "Français" },
  "el": { name: "Greek", nativeName: "Ελληνικά" },
  "he": { name: "Hebrew", nativeName: "עברית" },
  "ja": { name: "Japanese", nativeName: "日本語" },
  "ko": { name: "Korean", nativeName: "한국어" },
  "pl": { name: "Polish", nativeName: "Polski" },
  "ro": { name: "Romanian", nativeName: "Română" },
  "ru": { name: "Russian", nativeName: "Русский" },
  "es-419": { name: "Spanish (Latin America)", nativeName: "Español (Latinoamérica)" },
  "es-ES": { name: "Spanish (Spain)", nativeName: "Español (España)" },
  "uk": { name: "Ukranian", nativeName: "Українська" }
}
window.remoteFiles = remoteFiles;
const localization = {
  setLanguage: (languageId) => {
    //localeStore.setLocale(languageId);
  },
  getAllLanguages: (() => {
    let lastCall = 0;
    const debounceTime = 10000; // 10 second debounce
    let cachedResult = null;

    return async () => {
      const now = Date.now();
      if (cachedResult && now - lastCall < debounceTime) {
        //console.log("Returning cached result")
        return cachedResult;
      }
      //console.log("Returning new result")
      const projectId = 737627;
      try {
        const response = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/languages/progress?limit=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(window["BuildConfig"] || window.parent["BuildConfig"])["CAK"]()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json())["data"];
        cachedResult = Object.fromEntries(data.map(e => [e.data.languageId, e.data]));
        cachedResult["en-US"] = {
          "languageId": "en-US",
          "translationProgress": 100,
          "approvalProgress": 100,
          "language": {
            "id": "en-US",
            "name": "English, United States",
            "editorCode": "enus",
            "twoLettersCode": "en",
            "threeLettersCode": "eng",
            "locale": "en-US",
            "androidCode": "en-US",
            "pluralCategoryNames": [
              "one",
              "other"
            ],
            "pluralRules": "(n != 1)",
            "pluralExamples": [
              "1",
              "0, 2-999; 1.2, 2.07..."
            ],
            "textDirection": "ltr",
            "dialectOf": "en"
          }
        }
        lastCall = now;
        return cachedResult;

      } catch (error) {
        console.error('Error fetching languages:', error);
        return {}; // Return empty object if request fails
      }
    };
  })(),
  getLanguage: async (languageId) => {
    const baseUrl = 'https://raw.githubusercontent.com/groovelauncher/GrooveLauncherLocalization/main/languages';
    const files = ['colors', 'common', 'readme', 'settings', 'welcome'];
    const languageData = {};

    try {
      // Fetch all files in parallel
      const responses = await Promise.all(
        files.map(file =>
          fetch(`${baseUrl}/${languageId}/${file}.json`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .catch(error => {
              console.warn(`Failed to fetch ${file}.json for ${languageId}:`, error);
              return null;
            })
        )
      );

      // Combine all successful responses into languageData
      responses.forEach((data, index) => {
        if (data) {
          languageData[files[index]] = data;
        }
      });

      return languageData;
    } catch (error) {
      console.error('Error fetching language data:', error);
      return null;
    }
  }
}
class LocaleManager {
  constructor() {
    window._i18n = window._i18n || {
      currentLocale: localStorage.getItem('language') || 'en-US',
      translations: {},
      availableLocales: {
        userLocales: [],
        debugLocales: ["key", "index"]
      }
    };
    this._observer = null;
  }
  toLowerCase(str) {
    const languageCode = window._i18n.currentLocale.split('-')[0];
    return str.toLocaleLowerCase(languageCode);
  }
  toUpperCase(str) {
    const languageCode = window._i18n.currentLocale.split('-')[0];
    return str.toLocaleUpperCase(languageCode);
  }
  async getAvailableLocales(refresh = false, debug = false) {
    const localesData = window._i18n.availableLocales || {};
    if (refresh || !localesData.userLocales.length) {
      const allLocales = (await localization.getAllLanguages()) || {};
      window._i18n.availableLocales.userLocales = allLocales
    }
    return window._i18n.availableLocales
  }
  getLocaleName(locale) {
    const localeCode = locale || window._i18n.currentLocale;

    if (locale == "lol" || locale == "lol-US") {
      return { name: "LOLCAT", nativeName: "LOLCAT" }
    }
    // First check if we have it in localeNames
    const simpleCode = localeCode.split('-')[0];
    if (localeNames[localeCode]) {
      return localeNames[localeCode];
    } else if (localeNames[simpleCode]) {
      return localeNames[simpleCode];
    }

    // Fall back to ITL lookup
    const info = ITL.isoInfo(localeCode);
    if (info["type"]) {
      if (info["country"]) {
        return { name: info.language.name + ` (${info.country.name})`, nativeName: info.language.original + ` (${info.country.original})` };
      }
      return { name: info.language.name, nativeName: info.language.original };
    } else {
      return { name: info.name, nativeName: info.original };
    }
  }
  async init(force = false, fallback = false) {
    try {
      const loadingLocale = (window._i18n.availableLocales['debug-locales'] || []).includes(window._i18n.currentLocale)
        ? 'en-US'
        : window._i18n.currentLocale;

      if (force || Object.keys(window._i18n.translations).length === 0) {
        //
        // Try loading default locales
        if (window != window.parent && window.parent["_i18n"]) {
          window._i18n.translations = window.parent._i18n.translations
          window._i18n.defaultTranslations = window.parent._i18ndefaultTranslations

        } else {
          const defaultTranslations = {};
          window._i18n.defaultTranslations = {}
          await Promise.all(files.map(async (file) => {
            try {
              const response = await fetch(`./assets/defaultlocales/${file}.json`);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              defaultTranslations[file] = await response.json();
              window._i18n.defaultTranslations[file] = defaultTranslations[file]
            } catch (error) {
              console.error(`Failed to load default locale file ${file}:`, error);
            }
          }));

          if (Object.keys(defaultTranslations).length === 0) {
            throw new Error('Failed to load translations and default locales');
          }

          //window._i18n.translations = defaultTranslations;
          //localStorage.setItem('language', "en-US");

          //localeStore.setLocaleJSON(defaultTranslations);

          //

          const translations = await localeStore.getLocaleJSON();
          if (!translations) localStorage.setItem('language', "en-US");
          window._i18n.translations = Object.assign(defaultTranslations, translations || {});
        }

        //console.log("tyküledim")
      }
    } catch (err) {
      if (fallback) {
        console.error('Failed to load translations, falling back to English:', err);
        window._i18n.currentLocale = 'en-US';
        await this.init(true);
      }
      console.error('Failed to load translations:', err);
      throw err;
    }
    window.dispatchEvent(new CustomEvent("localeLoaded"));
  }

  t(key, params = {}) {
    // For "key" locale, return the key if it exists in translations
    if (window._i18n.currentLocale === 'key') {
      const keys = key.split('.');
      let value = window._i18n.translations;

      for (const k of keys) {
        value = value[k];
        if (!value) return 'undefined!';
      }
      return key;
    } else if (window._i18n.currentLocale === 'index') {
      const keys = key.split('.');
      let value = window._i18n.translations;
      let totalIndex = 0;
      let currentCount = 0;

      // Function to count all entries before this key
      const countEntries = (obj) => {
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'object') {
            countEntries(v);
          } else {
            currentCount++;
          }
        }
      };

      // Count entries until we find our key
      for (const k of keys) {
        if (!value[k]) return 'undefined!';

        // Count all entries in sibling objects before this key
        for (const [siblingKey, siblingValue] of Object.entries(value)) {
          if (siblingKey === k) break;
          currentCount = 0;
          countEntries(siblingValue);
          totalIndex += currentCount;
        }

        value = value[k];
      }

      return `@${keys[0]}-${totalIndex.toString().padStart(4, '0')}`;
    }

    // Original translation logic
    if (key in window._i18n.translations) {
      return window._i18n.translations[key];
    }
    if (key in window._i18n.translations) {
      return window._i18n.defaultTranslations[key];
    }
    if (!key) return 'undefined!'
    if (!key["split"]) return 'undefined!'
    const keys = key.split('.');
    var returnee = (() => {
      let value = window._i18n.translations;

      for (const k of keys) {
        value = value[k];
        returnee = value;
        if (!value) return 'undefined!';
      }
      return value
    })()
    if (returnee == "undefined!" && (window._i18n["defaultTranslations"] || (window.parent["_i18n"] ? window.parent._i18n["defaultTranslations"] : false))) {
      let value2 = window._i18n.defaultTranslations || window.parent._i18n.defaultTranslations;

      for (const k of keys) {
        //console.log("default", _i18n.defaultTranslations)

        value2 = value2[k];
        if (!value2) return 'undefined!';
      }
      returnee = value2
    }

    //console.log("returnee", returnee)
    return returnee.replace(/\{\{(\w+)\}\}/g, (_, param) => params[param] || '');
  }

  translateDOM() {
    // console.log('translateDOM');
    if (this._observer) {
      this._observer.disconnect();
    }

    const elements = document.querySelectorAll('[data-i18n],[data-i18n-init],[data-i18n-transform]');
    elements.forEach(el => this.translateElement(el));

    this._observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Handle added nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.hasAttribute('data-i18n')) {
              this.translateElement(node);
            }
          });
        }
        // Handle attribute changes
        else if (mutation.type === 'attributes' && (mutation.attributeName === 'data-i18n' || mutation.attributeName === 'data-i18n-params')) {
          this.translateElement(mutation.target);
        }
      });
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-i18n', 'data-i18n-params'] // Only watch these attributes
    });
  }

  translateElement(el) {
    const params = {};

    const paramsAttr = el.getAttribute('data-i18n-params');
    if (paramsAttr) {
      try {
        Object.assign(params, JSON5.parse(paramsAttr));
      } catch (e) {
        console.warn('Invalid i18n params:', paramsAttr);
        throw e;
      }
    }
    const transform = el.getAttribute('data-i18n-transform');

    if (el.hasAttribute('data-i18n-init')) {
      let text = this.t(el.getAttribute('data-i18n-init'), params);

      // Handle text transformation if attribute exists
      if (transform) {
        switch (transform.toLowerCase()) {
          case 'lc':
            text = this.toLowerCase(text);
            break;
          case 'uc':
            text = this.toUpperCase(text);
            break;
        }
      }

      el.innerHTML = text;
      el.removeAttribute('data-i18n-init');
      return;
    }
    const key = el.getAttribute('data-i18n');
    //console.log("T AGAIN")
    var translation = this.t(key, params);
    //console.log("T TRANSLAT", translation)
    if (transform) {
      switch (transform.toLowerCase()) {
        case 'lc':
          translation = this.toLowerCase(translation);
          break;
        case 'uc':
          text = this.toUpperCase(translation);
          break;
      }
    }
    el.innerHTML = translation
  }

  async setLocale(locale, progressCallback = null) {
    if (window._i18n.availableLocales.userLocales.length === 0) {
      await this.getAvailableLocales(true, true);
    }
    if (!(window._i18n.availableLocales.debugLocales.includes(locale) || Object.keys(window._i18n.availableLocales.userLocales).includes(locale))) {
      if (progressCallback) {
        progressCallback({
          status: 'error',
          error: `Invalid locale: ${locale}`,
          availableLocales: Object.keys(window._i18n.availableLocales.userLocales).concat(window._i18n.availableLocales.debugLocales)
        });
      }
      return false;
    }

    if (Object.keys(window._i18n.availableLocales.userLocales).includes(locale)) {
      const files = remoteFiles(locale);
      let downloadedFiles = 0;
      const totalFiles = Object.keys(files).length;

      for (const [key, url] of Object.entries(files)) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          const totalBytes = response.headers.get('content-length');
          const reader = response.body.getReader();
          let receivedBytes = 0;
          let chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedBytes += value.length;

            // Calculate progress
            const fileProgress = totalBytes ?
              Math.min(100, Math.round((receivedBytes / parseInt(totalBytes)) * 100)) :
              0;

            const currentFileContribution = totalBytes ?
              Math.min(1, receivedBytes / parseInt(totalBytes)) / totalFiles :
              0;
            const completedFilesContribution = downloadedFiles / totalFiles;
            const totalProgress = Math.min(100, Math.round((completedFilesContribution + currentFileContribution) * 100));

            if (progressCallback) {
              progressCallback({
                status: 'downloading',
                totalProgress,
                fileProgress,
                file: key,
                currentFile: downloadedFiles + 1,
                totalFiles
              });
            }
          }

          // Combine chunks and parse JSON
          const data = JSON.parse(new TextDecoder().decode(
            new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
          ));

          window._i18n.translations[key] = data;
          if (window.parent != window) window.parent._i18n.translations[key] = data;

          downloadedFiles++;

        } catch (error) {
          if (progressCallback) {
            progressCallback({
              status: 'error',
              error: `Failed to download ${key}: ${error.message}`,
              file: key,
              currentFile: downloadedFiles + 1,
              totalFiles
            });
          }
          console.error(`Failed to download ${key}:`, error);
          return false;
        }
      }
    }
    //console.log(window._i18n.translations)
    localeStore.setLocaleJSON(window._i18n.translations);
    window._i18n.currentLocale = locale;
    if (window.parent != window) window.parent._i18n.currentLocale = locale;

    // Set RTL if needed
    let isRTL = i18n.isRTL(locale);
    window.parent.GrooveBoard?.backendMethods?.setTextDirection(isRTL ? "rtl" : "ltr");


    localStorage.setItem('language', locale);
    await this.init();
    this.translateDOM();

    if (progressCallback) {
      await progressCallback({
        status: 'complete',
        locale: locale
      });

    }

    //console.log('Locale dispatch event:', window._i18n.currentLocale);
    window.dispatchEvent(new CustomEvent('localeChanged'));
    if (window.parent != window) window.parent.dispatchEvent(new CustomEvent('localeChanged'));

    return true;
  }

  getLocale() {
    return window._i18n.currentLocale;
  }
  isRTL(locale) {
    try {
      const loc = new Intl.Locale(locale);
      return loc.textInfo?.direction === 'rtl';
    } catch (e) {
      return false; // Fallback for invalid or unsupported locale
    }
  }
}

class LocaleStore {
  constructor() {
    this.dbName = 'localeDB';
    this.storeName = 'locales';
    this.db = null;
    this._initDB();
  }

  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async setLocaleJSON(data) {
    await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, 'currentLocale');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLocaleJSON() {
    await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('currentLocale');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeLocaleJSON() {
    await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete('currentLocale');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
const greetings = {
  entries: {
    "az": {
      "welcome": "Xoş gəldiniz",
      "welcome_back": "Yenidən xoş gəldiniz"
    },
    "bg": {
      "welcome": "Добре дошли",
      "welcome_back": "Добре дошли отново"
    },
    "de": {
      "welcome": "Willkommen",
      "welcome_back": "Willkommen zurück"
    },
    "es-419": {
      "welcome": "Bienvenido",
      "welcome_back": "Bienvenido de vuelta"
    },
    "es-ES": {
      "welcome": "Bienvenido",
      "welcome_back": "Bienvenido de vuelta"
    },
    "fi": {
      "welcome": "Tervetuloa",
      "welcome_back": "Tervetuloa takaisin"
    },
    "fr": {
      "welcome": "Bienvenue",
      "welcome_back": "Bienvenue de nouveau"
    },
    "hu": {
      "welcome": "Üdvözöljük",
      "welcome_back": "Üdv újra"
    },
    "lol": {
      "welcome": "Hai dere! Welcomz!",
      "welcome_back": "Ooh hai 'gain!"
    },
    "mk": {
      "welcome": "Добредојдовте",
      "welcome_back": "Добредојдовте назад"
    },
    "nl": {
      "welcome": "Welkom",
      "welcome_back": "Welkom terug"
    },
    "ro": {
      "welcome": "Bine ați venit",
      "welcome_back": "Bine ați revenit"
    },
    "ru": {
      "welcome": "Добро пожаловать",
      "welcome_back": "СДобро пожаловать обратно!"
    },
    "tr": {
      "welcome": "Hoş geldiniz",
      "welcome_back": "Tekrar hoş geldiniz"
    },
    "vi": {
      "welcome": "Chào mừng",
      "welcome_back": "Chào mừng trở lại"
    }
  },
  getRandomWelcome: function () {
    //Object.values(this.entries)
    //get random welcome from entries
    return Object.values(this.entries)[Math.floor(Object.keys(this.entries).length * Math.random())]
  }

}

const i18n = new LocaleManager();
const localeStore = new LocaleStore();
window.localeStore = localeStore
window.i18n = i18n
export default i18n;
export { LocaleStore, LocaleManager, i18n, localization, greetings };

