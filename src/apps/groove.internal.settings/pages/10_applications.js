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
                parent.liveTileProviders.forEach((provider, i) => {
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
                        liveTileGroup.querySelector("div.metro-dropdown-menu").append(option)
                    }
                })
            }
            if (liveTileGroup.querySelector("div.metro-dropdown-menu").innerHTML == "") {
                liveTileGroup.style.display = "none"
            } else {
                liveTileGroup.style.removeProperty("display")
            }

            // Setup per-app tile preferences
            setupPerAppTilePreferences(appdetail);

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

// Per-app tile preferences functionality
function setupPerAppTilePreferences(appdetail) {
    //console.log("Setting up per-app tile preferences for:", appdetail.packageName);

    // Get current per-app tile preferences
    const tilePrefs = getAppTilePreferences(appdetail.packageName);
    //console.log("Loaded tile preferences:", tilePrefs);

    // Setup icon dropdown
    setupIconDropdown(appdetail, tilePrefs);

    // Setup background dropdown  
    setupBackgroundDropdown(appdetail, tilePrefs);

    // Setup text color dropdown
    setupTextColorDropdown(appdetail, tilePrefs);
}

function setupIconDropdown(appdetail, tilePrefs) {
    const iconGroup = document.querySelector("#app-preference-icon");
    const iconDropdown = iconGroup.querySelector("div.metro-dropdown-menu");

    //    console.log("Setting up icon dropdown for:", appdetail.packageName, "current pref:", tilePrefs.icon);

    // Clear existing options
    iconDropdown.innerHTML = "";

    // Add default option
    const defaultOption = document.createElement("div");
    defaultOption.classList.add("metro-dropdown-option");
    defaultOption.setAttribute("value", "default");
    defaultOption.innerText = "Default";
    iconDropdown.appendChild(defaultOption);

    // Add monochrome option (only if supported)
    if (window.parent.Groove.supportsMonochromeIcons()) {
        console.log("monochrome supported")
        const monochromeOption = document.createElement("div");
        monochromeOption.classList.add("metro-dropdown-option");
        monochromeOption.setAttribute("value", "monochrome");
        monochromeOption.innerText = "Monochrome";
        iconDropdown.appendChild(monochromeOption);
    } else {
        console.log("monochrome not supported")
    }

    // Add icon pack options
    try {
        if (window.parent.Groove && window.parent.Groove.getIconPacks) {
            const iconPacks = JSON.parse(window.parent.Groove.getIconPacks());
            iconPacks.forEach(iconPack => {
                const iconPackInfo = window.parent.GrooveBoard.backendMethods.getAppDetails(iconPack, true);
                const option = document.createElement("div");
                option.classList.add("metro-dropdown-option");
                option.setAttribute("value", iconPack);
                option.innerText = iconPackInfo.label;
                iconDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.log("Error loading icon packs:", error);
    }

    // Set current selection
    const options = iconDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === tilePrefs.icon) {
            selectedIndex = index;
        }
    });
    iconDropdown.setAttribute("selected", selectedIndex);
    iconDropdown.selectOption(selectedIndex);
    //console.log("Set icon dropdown to index:", selectedIndex, "value:", tilePrefs.icon);

    // Add event listener
    iconDropdown.addEventListener('selected', (e) => {
        const selectedValue = options[e.detail.index].getAttribute("value");
        //console.log("Icon preference changed to:", selectedValue);
        const prefs = getAppTilePreferences(appdetail.packageName);
        prefs.icon = selectedValue;
        setAppTilePreferences(appdetail.packageName, prefs);

        // Apply the preference change immediately
        applyTilePreferencesToApp(appdetail.packageName, prefs);
    });
}

function setupBackgroundDropdown(appdetail, tilePrefs) {
    const backgroundGroup = document.querySelector("#app-preference-background");
    const backgroundDropdown = backgroundGroup.querySelector("div.metro-dropdown-menu");

    //console.log("Setting up background dropdown for:", appdetail.packageName, "current pref:", tilePrefs.background);

    // Set current selection
    const options = backgroundDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === tilePrefs.background) {
            selectedIndex = index;
        }
    });
    backgroundDropdown.setAttribute("selected", selectedIndex);
    backgroundDropdown.selectOption(selectedIndex);
    //console.log("Set background dropdown to index:", selectedIndex, "value:", tilePrefs.background);

    // Add event listener
    backgroundDropdown.addEventListener('selected', (e) => {
        const selectedValue = options[e.detail.index].getAttribute("value");
        //console.log("Background preference changed to:", selectedValue);
        const prefs = getAppTilePreferences(appdetail.packageName);
        prefs.background = selectedValue;
        setAppTilePreferences(appdetail.packageName, prefs);

        // Apply the preference change immediately
        applyTilePreferencesToApp(appdetail.packageName, prefs);
    });
}

function setupTextColorDropdown(appdetail, tilePrefs) {
    const textColorGroup = document.querySelector("#app-preference-text-color");
    const textColorDropdown = textColorGroup.querySelector("div.metro-dropdown-menu");

    //console.log("Setting up text color dropdown for:", appdetail.packageName, "current pref:", tilePrefs.textColor);

    // Set current selection
    const options = textColorDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === tilePrefs.textColor) {
            selectedIndex = index;
        }
    });
    textColorDropdown.setAttribute("selected", selectedIndex);
    textColorDropdown.selectOption(selectedIndex);
    //console.log("Set text color dropdown to index:", selectedIndex, "value:", tilePrefs.textColor);

    // Add event listener
    textColorDropdown.addEventListener('selected', (e) => {
        const selectedValue = options[e.detail.index].getAttribute("value");
        //console.log("Text color preference changed to:", selectedValue);
        const prefs = getAppTilePreferences(appdetail.packageName);
        prefs.textColor = selectedValue;
        setAppTilePreferences(appdetail.packageName, prefs);

        // Apply the preference change immediately
        applyTilePreferencesToApp(appdetail.packageName, prefs);
    });
}

// Apply tile preferences to the actual app in the launcher
function applyTilePreferencesToApp(packageName, prefs) {
    try {
        // Get effective preferences (applying global defaults where app setting is "default")
        const effectivePrefs = getEffectiveTilePreferences(packageName);
        //        console.log("Applying effective tile preferences for", packageName, ":", effectivePrefs);

        // Find the app tile in the parent launcher window
        const homeTile = window.parent.document.querySelector(`div.groove-home-tile[packagename='${packageName}']`);
        const appListItem = window.parent.document.querySelector(`div.groove-app-tile[packagename='${packageName}']`);

        // Apply preferences to both home tile and app list item
        [homeTile, appListItem].forEach(element => {
            if (element) {
                //console.log("Applying preferences to element:", element);
                // Use the main GrooveBoard function to apply preferences
                if (window.parent.GrooveBoard && window.parent.GrooveBoard.backendMethods.applyTilePreferences) {
                    window.parent.GrooveBoard.backendMethods.applyTilePreferences(element, packageName);
                }
            }
        });

        //console.log("Applied tile preferences for", packageName, effectivePrefs);
    } catch (error) {
        console.log("Error applying tile preferences:", error);
    }
}

function applyTilePreferencesToElement(element, effectivePrefs, packageName) {
    // Apply icon preference
    if (effectivePrefs.icon !== "default") {
        // TODO: Implement icon preference application
        // This would involve changing the icon source based on the preference
    }

    // Apply background preference
    if (effectivePrefs.background === "accent_color") {
        element.style.backgroundColor = "var(--accent-color)";
    } else if (effectivePrefs.background === "default") {
        element.style.backgroundColor = ""; // Reset to default
    }

    // Apply text color preference
    const titleElement = element.querySelector(".groove-home-tile-title, .groove-app-tile-title");
    if (titleElement) {
        if (effectivePrefs.textColor === "light") {
            titleElement.style.color = "#ffffff";
        } else if (effectivePrefs.textColor === "dark") {
            titleElement.style.color = "#000000";
        } else {
            titleElement.style.color = ""; // Reset to default
        }
    }
}

function getAppTilePreferences(packageName) {
    try {
        if (window.parent.Groove && window.parent.Groove.getAppTilePreferences) {
            const prefsStr = window.parent.Groove.getAppTilePreferences(packageName);
            return JSON.parse(prefsStr);
        }
    } catch (error) {
        console.log("Error getting app tile preferences:", error);
    }

    // Fallback to localStorage for web mode
    if (!localStorage["perAppTilePreferences"]) localStorage["perAppTilePreferences"] = JSON.stringify({});
    const perAppTilePreferences = JSON.parse(localStorage["perAppTilePreferences"]);
    if (!perAppTilePreferences[packageName]) {
        perAppTilePreferences[packageName] = {
            icon: "default",
            background: "default",
            textColor: "default"
        };
        localStorage["perAppTilePreferences"] = JSON.stringify(perAppTilePreferences);
    }
    return perAppTilePreferences[packageName];
}

function getGlobalTilePreferences() {
    // Get global preferences from Groove Tweaks
    if (!localStorage["globalTilePreferences"]) {
        localStorage["globalTilePreferences"] = JSON.stringify({
            icon: "default",
            background: "default",
            textColor: "default"
        });
    }
    return JSON.parse(localStorage["globalTilePreferences"]);
}

function getEffectiveTilePreferences(packageName) {
    // Get per-app preferences
    const appPrefs = getAppTilePreferences(packageName);
    const globalPrefs = getGlobalTilePreferences();

    // Return effective preferences (use global when app pref is "default")
    return {
        icon: appPrefs.icon === "default" ? globalPrefs.icon : appPrefs.icon,
        background: appPrefs.background === "default" ? globalPrefs.background : appPrefs.background,
        textColor: appPrefs.textColor === "default" ? globalPrefs.textColor : appPrefs.textColor
    };
}

function setAppTilePreferences(packageName, data) {
    try {
        if (window.parent.Groove && window.parent.Groove.setAppTilePreferences) {
            window.parent.Groove.setAppTilePreferences(packageName, JSON.stringify(data));
            //console.log("Saved app tile preferences via Groove API:", packageName, data);
        }
    } catch (error) {
        console.log("Error setting app tile preferences via Groove API:", error);
    }

    // Also save to localStorage for web mode and as backup
    getAppTilePreferences(packageName);
    const perAppTilePreferences = JSON.parse(localStorage["perAppTilePreferences"]);
    perAppTilePreferences[packageName] = data;
    localStorage["perAppTilePreferences"] = JSON.stringify(perAppTilePreferences);
    //console.log("Saved app tile preferences to localStorage:", packageName, data);

    // Trigger tile refresh when per-app preferences change
    if (window.parent) {
        window.parent.dispatchEvent(new CustomEvent('tilePreferencesChanged', {
            detail: { packageName, preferences: data }
        }));
        //console.log("Dispatched tilePreferencesChanged event");
    }
}