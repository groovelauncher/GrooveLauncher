
import GrooveElements from "./GrooveElements";
import eventReloads from "./eventReloads";
const BoardMethods = {
    finishLoading: () => {
        try {
            $(window).trigger("finishedLoading")
            const loader = document.getElementById("loader")
            setTimeout(() => {
                loader.classList.add("finished")
                setTimeout(() => {
                    loader.remove()
                }, 500);
            }, 500);
        } catch (error) {

        }
    },
    createHomeTile: (size = [0, 0], options = {}) => {
        options = Object.assign({ imageIcon: false, icon: "", title: "Unknown", packageName: "com.unknown", color: "default" }, options)
        switch (String(size)) {
            case "1,1":

                break;
            case "2,1":

                break;
            case "2,2":

                break;

            default:
                break;
        }
        const el = GrooveElements.wHomeTile(options.imageIcon, options.icon, options.title, options.packageName, options.color)
        $()
        $(el).css
        return el
    },
    createAppTile: (options) => {
        options = Object.assign({ imageIcon: false, icon: "", title: "Unknown", packageName: "com.unknown" }, options)
        const el = GrooveElements.wAppTile(options.imageIcon, options.icon, options.title, options.packageName)
        document.querySelector("#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container").appendChild(el)
        // window.scrollers.app_page_scroller.refresh()
        return el
    },
    createLetterTile: (letter) => {
        const el = GrooveElements.wLetterTile(letter)
        document.querySelector("#main-home-slider > div > div:nth-child(2) > div > div.app-list > div.app-list-container").appendChild(el)
        return el
    }
}
var appSortCategories = {}
window.appSortCategories = appSortCategories
function getLabelRank(char) {
    if (/^\d+$/.test(char)) {
        return 1; // Numbers
    } else if (/^[A-Za-z]+$/.test(char)) {
        return 2; // Letters (both uppercase and lowercase)
    } else {
        return 3; // Special characters
    }
}
function getLabelSortCategory(label) {
    const firstletter = String(label)[0]
    const labelRank = getLabelRank(window.normalizeDiacritics(String(label)[0]).toLocaleLowerCase("en"))
    if (labelRank == 1) {
        return "0-9"
    } if (labelRank == 2) {
        return window.normalizeDiacritics(firstletter).toLocaleLowerCase("en").toLocaleUpperCase("en");
    } else {
        return "&"
    }
}
function sortObjectsByLabel(a, b) {
    let labelA = window.normalizeDiacritics(String(a.label)).toLocaleLowerCase("en");
    let labelB = window.normalizeDiacritics(String(b.label)).toLocaleLowerCase("en");
    // Get the ranks for the first characters in the labels
    let rankA = getLabelRank(labelA[0]);
    let rankB = getLabelRank(labelB[0]);
    if (rankA === rankB) {
        // If ranks are the same, sort by label case-insensitively
        return labelA.localeCompare(labelB, "en", { sensitivity: "base" });
    } else {
        // Otherwise, sort by rank
        return rankA - rankB;
    }
}
function sortObjectsByKey(a, b) {
    let labelA = window.normalizeDiacritics(String(a[0])).toLocaleLowerCase("en");
    let labelB = window.normalizeDiacritics(String(b[0])).toLocaleLowerCase("en");
    // Get the ranks for the first characters in the labels
    let rankA = getLabelRank(labelA[0]);
    let rankB = getLabelRank(labelB[0]);
    if (rankA === rankB) {
        // If ranks are the same, sort by label case-insensitively
        return labelA.localeCompare(labelB, "en", { sensitivity: "base" });
    } else {
        // Otherwise, sort by rank
        return rankA - rankB;
    }
}


// Output: [{ label: "1" }, { label: "2" }, { label: "A" }, { label: "a" }, { label: "B" }, { label: "c" }, { label: "#" }, { label: "@" }]
const BackendMethods = {
    reloadApps: function (callback) {
        fetch(Bridge.getAppsURL())
            .then(resp => resp.json())
            .then(resp => {
                // replaceApps(resp);
                let array = resp.apps
                array.sort(sortObjectsByLabel);
                window["allappsarchive"] = array
                array.forEach(entry => {
                    const labelSortCategory = getLabelSortCategory(entry.label)
                    if (!!!appSortCategories[labelSortCategory]) appSortCategories[labelSortCategory] = []
                    appSortCategories[labelSortCategory].push(entry)

                });
                //appSortCategories = 
                appSortCategories = (Object.fromEntries(Object.entries(appSortCategories).sort(sortObjectsByKey)))
                Object.keys(appSortCategories).forEach(labelSortCategory => {
                    let letter = BoardMethods.createLetterTile(labelSortCategory == "0-9" ? "#" : labelSortCategory == "&" ? "" : labelSortCategory.toLocaleLowerCase("en"))
                    appSortCategories[labelSortCategory].forEach(app => {
                        const ipe = window.iconPackDB[app.packageName]
                        const el = BoardMethods.createAppTile({ title: app.label, packageName: app.packageName, imageIcon: ipe ? false : true, icon: ipe ? ipe.icon : Bridge.getDefaultAppIconURL(app.packageName) })
                        if (ipe) { if (ipe.pack == 0) el.classList.add("iconpack0"); else el.classList.add("iconpack1") }
                    });
                    // BoardMethods.createAppTile({ title: entry.label })
                });
                scrollers.app_page_scroller.refresh()
                eventReloads.appTile()
                /*
              // springBoard.reloadPages()
              if (callback && typeof callback == "function") callback(); else {
                  //  console.log("couldnt call callback")
              }*/
                // $("body").append(new cupertinoElements.appIcon("../mock/icons/default/com.android.chrome.png", "bb", "cc"))
            })
    },
    refreshInsets: () => {
        if (window.stopInsetUpdate) return;
        window.windowInsets = JSON.parse(Bridge.getSystemBarsWindowInsets());
        Object.keys(windowInsets).forEach((element) => {
            document.body.style.setProperty("--window-inset-" + element, windowInsets[element] + "px");
        });
    },
    navigation: {
        history: [],
        push: (change, forwardAction, backAction) => {
            forwardAction()
            console.log("pushed", change)
            BackendMethods.navigation.history.push({ forwardAction: forwardAction, change: change, backAction })
            history.pushState(change, "", window.location.href); // Explicitly using the current URL
        },
        back: (action = true) => {
            history.back()
            // try {
            //   } catch (error) {
            //} 
        },
        get lastPush() {
            return GrooveBoard.BackendMethods.navigation.history.slice(-1)[0]
        },
        invalidate:(change)=>{
            if (GrooveBoard.BackendMethods.navigation.lastPush.change == change) {
                GrooveBoard.BackendMethods.navigation.back()
            }
        }
    },
    get database() {
        console.log("get")
        return dadn
    },
    set database(data) {
        console.log("set")
        dadn = data
    },
}
var dadn = {
    kaka: "bok"
}
window.onpopstate = function (event) {
    console.log(event)
    const act = BackendMethods.navigation.history.pop()
    // try {
    act.backAction()
};
export default { BoardMethods, BackendMethods }
