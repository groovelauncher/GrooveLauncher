import GrooveBoard from "../../../scripts/GrooveBoard";
import GrooveElements from "../../../scripts/GrooveElements";

import jQuery from "jquery";
const $ = jQuery
document.querySelector("#uninstallappbutton").addEventListener("flowClick", e => {
    const packageName = window.lastSelectedApp.packageName
    if (parent.GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
        Groove.uninstallApp(packageName, 0);
        pageNavigation.settingsHome()
    } else {
        parent.GrooveBoard.alert(
            window.i18n.t("common.alerts.uninstall.title"),
            window.i18n.t("common.alerts.uninstall.message"),
            [{
                title: window.i18n.t("common.actions.yes"), style: "default", inline: true, action: () => {
                    Groove.uninstallApp(packageName, parent.GrooveBoard.backendMethods.packageManagerProvider.get());
                    pageNavigation.settingsHome()
                }
            }, { title: window.i18n.t("common.actions.no"), style: "default", inline: true, action: () => { } }]
        );
    }
})
function refreshAppList(params) {
    document.querySelector("#apps-tab > div.scroller > div.groove-list-view").innerHTML = "";
    var allappsarchive = !!window.parent.allappsarchive ? JSON.parse(JSON.stringify(window.parent.allappsarchive)) : window.parent.GrooveBoard.backendMethods.reloadAppDatabase()
    allappsarchive.map(e => {
        const appPreference = parent.GrooveBoard.backendMethods.getAppPreferences(e.packageName)
        if (appPreference.label != "auto") e.label = appPreference.label
        return e
    }).forEach(e => {
        const appPreference = parent.GrooveBoard.backendMethods.getAppPreferences(e.packageName)
        const appDetails = parent.GrooveBoard.backendMethods.getAppDetails(e.packageName)

        const el = GrooveElements.wListViewItem(appDetails.label, appPreference.label == "auto" ? "" : parent.GrooveBoard.backendMethods.getAppDetails(e.packageName, true).label)
        el.setAttribute("packagename", e.packageName)
        document.querySelector("#apps-tab > div.scroller > div.groove-list-view").append(el)
    });
    $("#apps-tab > div.scroller > div.groove-list-view > div.groove-list-view-item").on("flowClick", e => {
        try {
            document.querySelector("div.app-preference-form").style.setProperty("display", "none")
            delete window.lastSelectedApp

            const appdetail = parent.GrooveBoard.backendMethods.getAppDetails(e.target.getAttribute("packagename"))
            const appPreference = parent.GrooveBoard.backendMethods.getAppPreferences(e.target.getAttribute("packagename"))
            appNameChangerInput.value = getAppPreferences(e.target.getAttribute("packagename"))["label"] ? (getAppPreferences(e.target.getAttribute("packagename"))["label"] != "auto" ? getAppPreferences(e.target.getAttribute("packagename"))["label"] : appdetail.label) : appdetail.label
            appNameChangerInput.setAttribute("placeholder", window.parent.GrooveBoard.backendMethods.getAppDetails(e.target.getAttribute("packagename"), true).label)
            if (appPreference.shown) {
                document.querySelector("#app-list-show-toggle-switch").setAttribute("checked", "")
            } else {
                document.querySelector("#app-list-show-toggle-switch").removeAttribute("checked")
            }
            document.querySelector("#app-detail-tab > div.flow-scrollable > div.app-preference-form > div:nth-child(1) > div > p").innerText = appPreference.shown ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
            if (!appdetail.packageName.startsWith("com.unknown")) {
                document.querySelector("div.app-preference-form").style.removeProperty("display")
            }
            window.lastSelectedApp = appdetail
            document.querySelector("#appDetailPage > div.app-tabs > p").innerText = appdetail.label
            document.querySelector("#appDetailPage > div.settings-pages > div > div > div > div > p.group-description").innerText = appdetail.packageName
            if (appdetail.type == 0) {
                document.querySelector("#uninstallappbutton").style.display = "none"
            } else {
                document.querySelector("#uninstallappbutton").style.display = "block"
            }
            if (appdetail.packageName.startsWith("groove.internal")) {
                document.querySelector("#app-preference-show").style.display = "none"
                document.querySelector("#app-preference-name").style.display = "none"
            } else {
                document.querySelector("#app-preference-show").style.removeProperty("display")
                document.querySelector("#app-preference-name").style.removeProperty("display")
            }

            /*<div class="group" id="app-preference-live-tile">
                <p class="group-title" data-i18n="settings.apps.live_tile">Live tile</p>
                <div class="metro-dropdown-menu" selected="0">
                  <div class="metro-dropdown-option">

                  </div>
                </div>
              </div>
*/
            const liveTileGroup = document.querySelector("#app-preference-live-tile")
            liveTileGroup.querySelector("div.metro-dropdown-menu").innerHTML = ""
            if (window.parent.liveTileProviders) {
                console.log("buldum")
                parent.liveTileProviders.forEach((provider, i) => {
                    console.log("provide", provider)
                    if (provider.metadata.provide.includes(appdetail.packageName)) {
                        const option = document.createElement("div")
                        option.classList.add("metro-dropdown-option")
                        const existingOptions = liveTileGroup.querySelectorAll("div.metro-dropdown-option");
                        let assignedName = provider.metadata.name;
                        let counter = 2;
                        while ([...existingOptions].some(opt => opt.innerText === assignedName)) {
                            assignedName = provider.metadata.name + ` (${counter})`;
                            counter++;
                        }
                        option.innerText = assignedName;
                        option.setAttribute("data-id", provider.id)
                        console.log("ekledim", option)
                        liveTileGroup.querySelector("div.metro-dropdown-menu").append(option)
                    }
                })
            }
            if (liveTileGroup.querySelector("div.metro-dropdown-menu").innerHTML == "") {
                liveTileGroup.style.display = "none"
            } else {
                liveTileGroup.style.removeProperty("display")
            }
            pageNavigation.goToPage(6)
        } catch (error) {
            
            parent.GrooveBoard.alert(
                "Unable to Get App Details!",
                "Couldn’t retrieve details for this app.",
                [{ title: "Ok", style: "default", inline: true, action: () => { } }]
            );
       throw error;
        }

    })
}
refreshAppList()
function getAppPreferences(packageName) {
    if (!localStorage["perAppPreferences"]) localStorage["perAppPreferences"] = JSON.stringify({})
    const perAppPreferences = JSON.parse(localStorage["perAppPreferences"])
    if (!perAppPreferences[packageName]) {
        perAppPreferences[packageName] = {}
        localStorage["perAppPreferences"] = JSON.stringify(perAppPreferences)
    }
    return perAppPreferences[packageName]
}
function setAppPreferences(packageName, data) {
    getAppPreferences(packageName)
    const perAppPreferences = JSON.parse(localStorage["perAppPreferences"])
    perAppPreferences[packageName] = data
    localStorage["perAppPreferences"] = JSON.stringify(perAppPreferences)
}
function updateAppDetailsRender(packageName) {
    const appPreference = window.parent.GrooveBoard.backendMethods.getAppPreferences(packageName)
    const rawAppDetails = window.parent.GrooveBoard.backendMethods.getAppDetails(packageName, true)
    var label = appPreference.label == "auto" ? rawAppDetails.label : appPreference.label
    const pageTitle = document.querySelector("#appDetailPage > div.app-tabs > p")
    if (pageTitle) pageTitle.innerText = label
    const listTitle = document.querySelector(`div.groove-list-view-item[packagename='${packageName}'] > p.groove-list-view-item-title`)
    if (listTitle) listTitle.innerText = label
    window.parent.GrooveBoard.backendMethods.reloadApps()
    const homeTile = window.parent.document.querySelector(`div.groove-home-tile[packagename='${packageName}']`)
    if (homeTile) {
        homeTile.setAttribute("title", label)
        homeTile.querySelector("p.groove-home-tile-title").innerText = label
    }

    if (window.parent.GrooveBoard) {
        refreshAppList()
    }
}
const appNameChangerInput = document.querySelector("div.app-preference-form > div:nth-child(2) > input")
appNameChangerInput.addEventListener("change", e => {
    if (!window["lastSelectedApp"]) return
    var value = e.target.value
    if (e.target.value == " " || e.target.value == "") value = auto
    const appPreference = getAppPreferences(window.lastSelectedApp.packageName)
    appPreference.label = value
    setAppPreferences(window.lastSelectedApp.packageName, appPreference)
    updateAppDetailsRender(window.lastSelectedApp.packageName)
    // const perAppPreferences = JSON.parse(localStorage["perAppPreferences"])
})

document.querySelector("#app-list-show-toggle-switch").addEventListener("checked", (e) => {
    document.querySelector("#app-detail-tab > div.flow-scrollable > div.app-preference-form > div:nth-child(1) > div > p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    const appPreference = getAppPreferences(window.lastSelectedApp.packageName)
    if (e.target.hasAttribute("checked")) {
        appPreference.shown = true
    } else {
        appPreference.shown = false
    }
    setAppPreferences(window.lastSelectedApp.packageName, appPreference)
    updateAppDetailsRender(window.lastSelectedApp.packageName)
})