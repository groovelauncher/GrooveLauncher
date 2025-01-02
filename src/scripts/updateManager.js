import { type } from "jquery";

const lastFetchedUpdate = "lastFetchedUpdate";
const lastDismissedUpdate = "lastAcknowledgedUpdate";
const isHome = window == window.parent
const bottomBar = window.parent.document.querySelector("#main-home-slider > div > div.slide-page.slide-page-home > div.inner-page.tile-list-page > div > div.app-page-icon-banner")
localStorage.lastUpdateCheck = localStorage.lastUpdateCheck || "0"
var updateInterval = 1 * 60 * 60 * 1000 // 1 hour
window.addEventListener("activityPause", () => {
    updateInterval = 3 * 60 * 60 * 1000 // 3 hours
})
window.addEventListener("activityResume", () => {
    updateInterval = 1 * 60 * 60 * 1000 // 1 hour
})
if (!window.parent.updateCycleInterval) window.parent.updateCycleInterval = setInterval(() => {
    var lastUpdateCheck = Math.max(0, Number(localStorage.lastUpdateCheck || "0"))
    if (Date.now() - lastUpdateCheck > updateInterval) {
        setTimeout(() => {
            //only check if there is no update fetched. or last update check was 1 week ago
            if (!localStorage[lastFetchedUpdate] || (Date.now() - lastUpdateCheck > (1 * 7 * 24 * 60 * 60 * 1000))) { localStorage.lastUpdateCheck = Date.now(); checkUpdate() }
        }, 10);
    }
}, 1000);

function resetUpdate() {
    localStorage.removeItem(lastFetchedUpdate)
    localStorage.removeItem(lastDismissedUpdate)
}

setTimeout(() => {
    if (localStorage[lastFetchedUpdate]) {
        const lastF = JSON.parse(localStorage[lastFetchedUpdate])
        if (isUpdateValid(lastF)) {
            console.log("vslid")
            if (isUpdateNew(lastF)) {
                console.log("new")
                showUpdateBanner(lastF)
            }
        }
    }
}, 1000);
function checkUpdate(force = false) {
    console.log("chedk updatre")
    const isBeta = window.parent.Groove.getAppVersion().includes("beta") || window.parent.Groove.getAppVersion() == 'web-test'
    return new Promise((resolve, reject) => {
        if (!force && localStorage.getItem(lastFetchedUpdate)) {
            if (isUpdateNew(JSON.parse(localStorage[lastFetchedUpdate]))) {
                resolve(JSON.parse(localStorage.getItem(lastFetchedUpdate)));
                showUpdateBanner(JSON.parse(update))
                return;
            }
        }
        fetch('https://api.github.com/repos/window.parent.Groovelauncher/window.parent.GrooveLauncher/releases?per_page=10')
            .then(response => response.json())
            .then(releases => {
                if (releases["filter"]) {
                    const availableReleases = releases.filter(release => (release.name.includes("beta") == isBeta))
                    if (availableReleases.length) {
                        const update = availableReleases[0]
                        console.log(update)
                        if (update.name == window.parent.Groove.getAppVersion()) {
                            console.log("aynı")
                            resolve(false)
                        } else {
                            if (isUpdateValid(update)) {
                                resolve(update)
                                showUpdateBanner(update)
                                localStorage.setItem(lastFetchedUpdate, JSON.stringify(update))
                                console.log("releases var", releases)

                            } else {
                                console.log("releases YOK", releases)
                                reject(new Error("Unknown update package"))
                            }
                        }
                    } else {
                        reject(new Error("Can't get updates"))
                    }
                    document.querySelector("#updatebutton").classList.remove("loading")
                } else {
                    //api limit exceeded
                    reject(new Error("Failed to fetch releases or API limit exceeded"))
                }
            })
            .catch(reject);

    })

}
function isUpdateValid(update) { try { if (typeof update == "string") update = JSON.parse(update); update.name; update.id; update.body; update.tag_name; return true; } catch (error) { return false } }
function isUpdateDismissed(update) { return isUpdateValid(update) ? update.id == JSON.parse(localStorage.getItem(lastDismissedUpdate)) : false }

function dismissUpdate(update) {
    if (typeof update == "string") update = JSON.parse(update)
    if (isUpdateValid) {
        localStorage.setItem(lastDismissedUpdate, update.id)
        return true
    }
    return false
}
function isUpdateNew(update) {
    return update.name != window.parent.Groove.getAppVersion()
}
function showUpdateBanner(update) {
    if (!isUpdateValid(update)) return
    if (isUpdateDismissed(update)) return
    console.log("showbanenr", update)
    if (bottomBar.querySelector("div.update-banner")) bottomBar.querySelector("div.update-banner").remove()
    const updateBanner = document.createElement("div")
    updateBanner.classList.add("update-banner")
    updateBanner.innerHTML = `
        <h1 class="update-title" data-i18n="settings.alerts.update_available.title">
            ${window.parent.i18n.t("settings.alerts.update_available.title")}
        </h1>
        <p class="update-version">${update.name}</p>
        <div class="update-actions">
            <button class="update-read-more">read more</button>
            <button class="update-dismiss">dismiss</button>
        </div>
`
    updateBanner.querySelector("button.update-dismiss").addEventListener("flowClick", () => {
        dismissUpdate(update)
        updateBanner.classList.add("hide-banner")
        setTimeout(() => {
            updateBanner.remove()
        }, 200);
    })
    bottomBar.appendChild(updateBanner)
}