document.querySelector("#resetbtn").addEventListener("flowClick", () => {

    window.parent.GrooveBoard.alert(
        "Reset Groove Launcher?",
        "This will reset your launcher to its default settings. All customizations will be lost.",
        [{
            title: "Yes", style: "default", inline: true, action: async () => {
                await window.parent.GrooveBoard.backendMethods.reset()
                appViewEvents.reloadApp()
            }
        }, { title: "No", style: "default", inline: true, action: () => { } }]
    );
})
function alreadyUpToDate() {
    window.parent.GrooveBoard.alert(
        "Up to Date!",
        "You have the grooviest version of Groove Launcher.",
        [{ title: "Ok", style: "default", inline: true, action: () => { } }]
    );
}
function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;

    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }

    return `${size.toFixed(1)} ${units[index]}`;
}
document.querySelector("#updatebutton").addEventListener("flowClick", (e) => {
    e.target.classList.add("loading")
    const isBeta = Groove.getAppVersion().includes("beta") || Groove.getAppVersion() == 'web-test'
    fetch('https://api.github.com/repos/groovelauncher/GrooveLauncher/releases?per_page=10')
        .then(response => response.json())
        .then(releases => {
            const availableReleases = releases.filter(release => (release.name.includes("beta") == isBeta))
            if (availableReleases.length) {
                const update = availableReleases[0]
                const updateUrl = update.assets.length == 1 ? update.assets[0].browser_download_url : update.html_url
                parent.GrooveBoard.alert(
                    "Update Available!",
                    update.assets.length == 1 ? `A new version <strong>(${update.name})</strong> is available, sized at ${formatFileSize(update.assets[0].size)}. Would you like to download it?`
                        : `A new version <strong>${update.name}</strong> is available. Would you like to download it?`,
                    [{
                        title: "Yes", style: "default", inline: true, action: () => {
                            Groove.openURL(updateUrl)
                        }
                    }, { title: "No", style: "default", inline: true, action: () => { } }]
                );
            } else {
                alreadyUpToDate()
            }
            document.querySelector("#updatebutton").classList.remove("loading")
        })
        .catch(error => {
            window.parent.GrooveBoard.alert(
                "Update Check Failed!",
                "Unable to check for app updates. Please try again later.",
                [{ title: "Ok", style: "default", inline: true, action: () => { } }]
            );
            console.error('Error:', error)
        });
})
document.querySelectorAll("div.credit-item > p:nth-child(2)").forEach(e => e.addEventListener("flowClick", function (event) {
    Groove.openURL(e.getAttribute("url"))
}))

document.querySelector("#about-app-version").innerText = "Version: " + Groove.getAppVersion()
document.querySelector("#about-webview-version").innerText = "WebView Version: " + Groove.getWebViewVersion()
function incompatibleWebViewVersion(compatible = false) {
    if (compatible) {
        document.querySelector("#about-webview-version").innerHTML += " <span style='color:var(--metro-color-green);'>(compatible)</span>"
    } else {
        document.querySelector("#about-webview-version").innerHTML += " <span style='color:var(--metro-color-red);'>(incompatible)</span>"
    }
}
try {
    var majorVersion = Number(Groove.getWebViewVersion().split(".")[0])
    if (majorVersion < 125 || String(majorVersion) == "NaN") {
        incompatibleWebViewVersion()
    } else {
        incompatibleWebViewVersion(true)
    }
} catch (error) {
    incompatibleWebViewVersion()
}
document.querySelector("#buymeacoffee").addEventListener("flowClick", (e) => {
    Groove.openURL('https://www.buymeacoffee.com/berkaytumal')
})