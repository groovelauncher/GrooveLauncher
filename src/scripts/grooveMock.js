
import jQuery from "jquery";
import GrooveBoard from "./GrooveBoard";
const $ = jQuery
var deletedApps = new Set()
class GrooveMock {
    mockURL = ""
    #retrievedApps = []
    constructor(mockURL) {
        this.mockURL = mockURL;
        this.#retrievedApps = []
        var retrievedApps = this.#retrievedApps
        $.getJSON(mockURL, function (data) {
            data.apps.forEach(app => {
                if (app.packageName != "web.bmdominatezz.gravy") retrievedApps.push({ packageName: app.packageName, label: app.label, type: app.type })
            });
            retrievedApps.push({ packageName: "groove.internal.settings", label: "Groove Settings", type: 0 })
        });

    }
    getSystemInsets() {
        return JSON.stringify({
            left: 0, top: 32, right: 0, bottom: 50
        })
    }
    retrieveApps() {
        var retrievedApps = this.#retrievedApps
        return JSON.stringify(retrievedApps.filter(e => !deletedApps.has(e.packageName)))
    }
    getAppLabel() {
        return "App"
    }
    getAppIconURL(packageName = "undefined") {
        if (packageName == "instagram.example") {
            return JSON.stringify({ foreground: new URL("./mock/apps.json", window.location.href.toString()).href.split("/").slice(0, -1).join("/") + "/icons/default/" + packageName + "-fg.png", background: new URL("./mock/apps.json", window.location.href.toString()).href.split("/").slice(0, -1).join("/") + "/icons/default/" + packageName + "-bg.png" })
        } else {
            return JSON.stringify({ foreground: new URL("./mock/apps.json", window.location.href.toString()).href.split("/").slice(0, -1).join("/") + "/icons/default/" + packageName + ".png", background: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>` })
        }
    }
    launchApp(packageName) {
        console.log("Start app:", packageName)
        if (packageName.startsWith("groove.internal")) GrooveBoard.backendMethods.launchInternalApp(packageName);
        return true
    }
    uninstallApp(packageName) {
        console.log("Uninstall app:", packageName)
        deletedApps.add(packageName)
        setTimeout(() => {
            console.log("Uninstall event sent!")
            window.dispatchEvent(new CustomEvent("appUninstall", { detail: { packagename: packageName } }))
        }, 2000);
        return true
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
        return "web-test"
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