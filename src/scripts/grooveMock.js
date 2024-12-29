import jQuery from "jquery";
import GrooveBoard from "./GrooveBoard";
const $ = jQuery
var deletedApps = new Set()
import BuildConfigMock from "./BuildConfigMock";
// Add constants at the top
const CONSTANTS = {
    INTERNAL_SETTINGS_APP: 'groove.internal.settings',
    DEFAULT_SYSTEM_INSETS: { left: 0, top: 32, right: 0, bottom: 50 },
    MOCK_ICON_PATH: '/icons/default/',
    MOCK_CONTACT_AVATAR_PATH: '/contacts/',
    EMPTY_SVG: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
};

class GrooveMock {
    mockURL = '';
    #retrievedApps = [];
    constructor(mockURL) {
        this.mockURL = mockURL;
        this.#retrievedApps = [];

        // Use async/await pattern instead of callback
        this.#initializeApps();
    }

    async #initializeApps() {
        try {
            const response = await fetch(this.mockURL);
            const data = await response.json();

            this.#retrievedApps = data.apps
                .filter(app => app.packageName !== 'web.bmdominatezz.gravy')
                .map(app => ({
                    packageName: app.packageName,
                    label: app.label,
                    type: app.type
                }));

            this.#retrievedApps.push({
                packageName: CONSTANTS.INTERNAL_SETTINGS_APP,
                label: 'Groove Settings',
                type: 0
            });
        } catch (error) {
            console.error('Failed to initialize apps:', error);
        }
    }

    getSystemInsets() {
        return JSON.stringify(CONSTANTS.DEFAULT_SYSTEM_INSETS);
    }
    retrieveApps() {
        var retrievedApps = this.#retrievedApps
        return JSON.stringify(retrievedApps.filter(e => !deletedApps.has(e.packageName)))
    }
    getAppLabel() {
        return "App"
    }
    getAppIconURL(packageName = 'undefined') {
        //const baseURL = new URL('./mock/apps.json', window.location.href);
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_ICON_PATH;

        if (packageName == 'instagram.example' || packageName == "com.google.android.googlequicksearchbox") {
            return JSON.stringify({
                foreground: `${iconPath}${packageName}-fg.png`,
                background: `${iconPath}${packageName}-bg.png`
            });
        }

        return JSON.stringify({
            foreground: `${iconPath}${packageName}.png`,
            background: CONSTANTS.EMPTY_SVG
        });
    }
    launchApp(packageName) {
        console.log("Start app:", packageName)
        if (packageName.startsWith("groove.internal")) GrooveBoard.backendMethods.launchInternalApp(packageName);
        return true
    }
    uninstallApp(packageName) {
        console.log('Uninstall app:', packageName);
        deletedApps.add(packageName);

        // Use Promise instead of setTimeout
        return new Promise(resolve => {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('appUninstall', {
                    detail: { packagename: packageName }
                }));
                console.log('Uninstall event sent!');
                resolve(true);
            }, 2000);
        });
    }
    launchAppInfo(packageName) {
        console.log("Launch app info:", packageName)
        return true
    }
    setStatusBarAppearance(option) {
        console.log("setStatusBarAppearance:", option)
    }
    setNavigationBarAppearance(option) {
        console.log("setNavigationBarAppearance:", option)
    }
    searchStore(appName) {
        console.log("searchStore:", appName)
    }
    setUIScale(scale) {
        console.log("setUIScale:", scale * 100 + "%")
    }
    openURL(url) {
        window.open(url, "_blank")
    }
    getAppVersion() {
        return "0.5.3-beta.5"
    }
    getWebViewVersion() {
        const versionName = "chrome"
        const versionCode = "chrome"
        return versionName + " (code: " + versionCode + ")";

    }
    isDeviceRooted() { return false }
    isShizukuAvailable() { return true }
    getDefaultApps() {
        return JSON.stringify({
            "phoneApp": "com.google.android.dialer",
            "messageApp": "com.google.android.apps.messaging",
            "browserApp": "com.android.chrome",
            "mailApp": "com.google.android.gm",
            "storeApp": "com.android.vending",
            "contactsApp": "com.google.android.contacts",
            "musicApp": "com.google.android.apps.youtube.music",
            "galleryApp": "com.google.android.apps.photos"
        })
    }
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log("Copied to clipboard:", text);
            return true;
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            return false;
        }
    }
    getDisplayOrientation() {
        if (window.innerWidth > window.innerHeight) {
            return "landscape"
        } else {
            return "portrait"
        }
    }
    setDisplayOrientationLock(orientation) {
        console.log("setDisplayOrientationLock:", orientation)
    }
    getContacts() {
        return JSON.stringify([
            { name: "Contact 1", id: "1", hasAvatar: true },
            { name: "Contact 2", id: "2", hasAvatar: true },
            { name: "Contact 3", id: "3", hasAvatar: true },
            { name: "Contact 4", id: "4", hasAvatar: true },
            { name: "Contact 5", id: "5", hasAvatar: true },
            { name: "Contact 6", id: "6", hasAvatar: true },
            { name: "Contact 7", id: "7", hasAvatar: true },
            { name: "Contact 8", id: "8", hasAvatar: true },
            { name: "Contact 9", id: "9", hasAvatar: true },
            { name: "Contact 10", id: "10", hasAvatar: true }
        ])
    }
    getPhotos() {
        return JSON.stringify([
            { id: "1", uri: "1" },
            { id: "2", uri: "2" },
            { id: "3", uri: "3" },
            { id: "4", uri: "4" },
            { id: "5", uri: "5" },
            { id: "6", uri: "6" },
            { id: "7", uri: "7" },
            { id: "8", uri: "8" },
            { id: "9", uri: "9" },
            { id: "10", uri: "10" }
        ])
    }
    getContactAvatarURL(id) {
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_CONTACT_AVATAR_PATH;
        return `${iconPath}${id}.jpeg`;
    }
    getPhotoURL(id) {
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_CONTACT_AVATAR_PATH;
        return `${iconPath}${id}.jpeg`;
    }
    appReady(){
        console.log("App ready")
    }
    setAccentColor(){
        
    }
}
export default GrooveMock;
export { BuildConfigMock, GrooveMock }