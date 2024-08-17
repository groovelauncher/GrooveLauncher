
import jQuery from "jquery";
import GrooveBoard from "./GrooveBoard";
const $ = jQuery
class GrooveMock {
    mockURL = ""
    #retrievedApps = []
    constructor(mockURL) {
        this.mockURL = mockURL;
        this.#retrievedApps = []
        var retrievedApps = this.#retrievedApps
        $.getJSON(mockURL, function (data) {
            data.apps.forEach(app => {
                retrievedApps.push({ packageName: app.packageName, label: app.label })
            });
            retrievedApps.push({ packageName: "groove.internal.settings", label: "Groove Settings" })
        });

    }
    getSystemInsets() {
        return JSON.stringify({ left: 0, top: 32, right: 0, bottom: 0 })
    }
    retrieveApps() {
        return JSON.stringify(this.#retrievedApps)
    }
    getAppIconURL(packageName = "undefined") {
        return new URL("./mock/apps.json", window.location.href.toString()).href.split("/").slice(0, -1).join("/") + "/icons/default/" + packageName + ".png"
    }
    launchApp(packageName) {
        console.log("Start app:", packageName)
        if (packageName.startsWith("groove.internal")) GrooveBoard.backendMethods.launchInternalApp(packageName);
        return true
    }
    uninstallApp(packageName) {
        console.log("Uninstall app:", packageName)
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
    getAppVersion(){
        return "web-test"
    }
}
export default GrooveMock;