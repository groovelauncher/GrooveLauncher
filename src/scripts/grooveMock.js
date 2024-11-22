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
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_ICON_PATH;

        if (packageName === 'instagram.example') {
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
        return "0.4.3-beta.4"
    }
    getWebViewVersion() {
        return "chrome"
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
}
export default GrooveMock;
export { BuildConfigMock, GrooveMock }