const { app, protocol, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const mime = require("mime-types");
const { sandboxed } = require('process');
var metroApps = require('get-metro-apps');
const getMetroApps = require('get-metro-apps');

var win;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true,
            webSecurity: {
                nodeIntegration: true,  // Enable Node.js integration
                contextIsolation: false, // Disable context isolation
                sandbox: false,         // Disable sandboxing
            }
        }
    });
    win.maximize();
    win.loadURL('https://appassets.androidplatform.net/assets/index.html');
    win.openDevTools()
    //this.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    win.show()
}

app.whenReady().then(() => {
    protocol.interceptBufferProtocol('https', (request, callback) => {
        const url = new URL(request.url); // Strip 'http://' from the start of the URL
        var filePath = path.join(__dirname, url.pathname);

        fs.readFile(filePath, (error, data) => {
            if (error) {
                callback({
                    mimeType: 'text/plain',
                    data: Buffer.from('Not Found'),
                });
            } else {
                callback({
                    mimeType: mime.lookup(filePath) || 'text/plain',
                    data: data,
                });
            }
        });
    });
    createWindow();
});

var allappsarchive = []
const Groove = {
    getSystemInsets: () => {
        return JSON.stringify({ left: 0, top: 0, right: 0, bottom: 0 })
    },
    retrieveApps: async () => {

        var apps = []
        var metroapps = await metroApps()
        metroapps.forEach(e => {
            if (e["aumid"] && e["name"]) {
                if (e.name.value.startsWith("@")) {
                    apps.push({ packageName: e.aumid.value, label: e.name.value.split("AppDisplayName_").slice(-1)[0] })
                }
            }
        });
        apps.push({ packageName: "groove.internal.settings", label: "Groove Settings" })

        return JSON.stringify(apps)
    },
    gertAppLabel: () => { },
    getAppIconURL: () => { },
    launchApp: (packageName) => {
        if (packageName.startsWith("groove.internal")) win.webContents.executeJavaScript(`GrooveBoard.backendMethods.launchInternalApp("${packageName}");`)
        return true
    },
    uninstallApp: () => { },
    launchAppInfo: () => { },
    setStatusBarAppearance: () => { },
    setNavigationBarAppearance: () => { },
    searchStore: () => { },
    setUIScale: () => { },
    openURL: () => { },
    getAppVersion: () => { },
    getWebViewVersion: () => { },
    getMetroApps: async () => { return await metroApps() },
}
ipcMain.on('grooveJavascriptInterface', async (event, arg) => {
    console.log('Received ping with argument:', arg);
    //if (Groove[])
    if (arg) if (arg["function"]) if (Groove[arg["function"]]) {
        event.returnValue = await Groove[arg["function"]](...(arg["arguments"] || []));
    }

});