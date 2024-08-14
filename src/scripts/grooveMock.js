
import jQuery from "jquery";
const $ = jQuery
class GrooveMock {
    mockURL = ""
    #retrievedApps = []
    constructor(mockURL) {
        this.mockURL = mockURL;
        this.#retrievedApps = []
        var retrievedApps = this.#retrievedApps
        $.getJSON(mockURL, function (data) {
            console.log(data.apps)
            data.apps.forEach(app => {
                retrievedApps.push({packageName:app.packageName,label:app.label})
            });
        });

    }
    getSystemInsets() {
        return JSON.stringify({ left: 0, top: 0, right: 0, bottom: 0 })
    }
    retrieveApps() {
        return JSON.stringify(this.#retrievedApps)
    }
    getAppIconURL(packageName="undefined"){
        return new URL("./mock/apps.json",window.location.href.toString()).href.split("/").slice(0,-1).join("/") + "/icons/default/" + packageName + ".png"
    }
    launchApp(packageName){
        console.log("Start app:",packageName)
        return true
    }
    uninstallApp(packageName){
        console.log("Uninstall app:",packageName)
        return true
    }
    launchAppInfo(packageName){
        console.log("Launch app info:",packageName)
        return true
    }
    setStatusBarAppearance(){
        console.log("setStatusBarAppearance")
    }
    setNavigationBarAppearance(){
        console.log("setNavigationBarAppearance")
    }
}
export default GrooveMock;