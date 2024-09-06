const { contextBridge, ipcRenderer } = require('electron');
const send = (arg) => ipcRenderer.sendSync('grooveJavascriptInterface', arg)

const Groove = {
    getSystemInsets: () => send({ function: "getSystemInsets" }),
    retrieveApps: () => send({ function: "retrieveApps" }),
    gertAppLabel: () => send({ function: "gertAppLabel" }),
    getAppIconURL: () => send({ function: "getAppIconURL" }),
    launchApp: (packageName) => send({ function: "launchApp", arguments: [packageName] }),
    uninstallApp: () => send({ function: "uninstallApp" }),
    launchAppInfo: () => send({ function: "launchAppInfo" }),
    setStatusBarAppearance: () => send({ function: "setStatusBarAppearance" }),
    setNavigationBarAppearance: () => send({ function: "setNavigationBarAppearance" }),
    searchStore: () => send({ function: "searchStore" }),
    setUIScale: () => send({ function: "setUIScale" }),
    openURL: () => send({ function: "openURL" }),
    getAppVersion: () => send({ function: "getAppVersion" }),
    getWebViewVersion: () => send({ function: "getWebViewVersion" }),
    getMetroApps: () => send({ function: "getMetroApps" })

}
contextBridge.exposeInMainWorld('Groove', Groove);