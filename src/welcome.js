import iconPackConverter from "./scripts/iconPack.js";
import { newerThan, olderThan, compareVersions } from "./scripts/versioning.js";
import { grooveThemes } from "./scripts/GrooveProperties.js";
window.newerThan = newerThan
window.olderThan = olderThan
window.compareVersions = compareVersions
import jQuery from "jquery";
window.$ = jQuery
import { i18n, greetings } from './scripts/localeManager';
await i18n.init();
window.i18n = i18n;
window.greetings = greetings
const allPermissions = ["CONTACTS", "PHOTOS", "NOTIFICATIONS", "ACCESSIBILITY"]

import { GrooveMock, BuildConfigMock } from "./scripts/grooveMock.js";
window.GrooveRole = "main"
if (GrooveMockInstance) {
    //window.Groove = new GrooveMock("./mock/apps.json")
    window.Groove = new GrooveMock("./mock/apps.json")
    await Groove.initializeApps()
    window.BuildConfig = new BuildConfigMock()
    document.body.classList.add("groove-mock")
}

import { GrooveScroll } from "./scripts/overscrollFramework.js";
import detectDeviceType from "./scripts/detectDeviceType";
import GrooveBoard from "./scripts/GrooveBoard";
window.GrooveBoard = GrooveBoard
import "./scripts/flowTouch.js";

$(window).on("systemInsetsChange", function () {
    GrooveBoard.backendMethods.refreshInsets()
})
GrooveBoard.backendMethods.refreshInsets()
setTimeout(() => {
    var firstpage = $(".setup-page").eq(0)
    firstpage.addClass("active").addClass("button-anim")
    setTimeout(() => {
        firstpage.removeClass("button-anim")
    }, 500);
}, 1000);
window.currentPage = 0
function goToPage(index) {
    if (index == 0) {
        $("#background").removeClass("hide")
    } else {
        $("#background").addClass("hide")
    }
    if (index == 7) {
        $("body").addClass("fade-out")
    }
    const oldpage = currentPage
    currentPage = index
    $(".setup-page").eq(0).css("opacity", "")
    const p0 = $(".setup-page").eq(oldpage)
    const p1 = $(".setup-page").eq(index)
    p0.removeClass("active")
    if (index > oldpage) {
        p0.addClass("leave-0")
        p1.addClass("enter-0")
    } else {
        p0.addClass("leave-1")
        p1.addClass("enter-1")
    }
    setTimeout(() => {
        p0.removeClass("leave-0 leave-1 enter-0 enter-1 active")
        p1.removeClass("leave-0 leave-1 enter-0 enter-1")
        p1.addClass("active")
        p1.addClass("active").addClass("button-anim")
        setTimeout(() => {
            p1.removeClass("button-anim")
        }, 1000);
    }, 800);
}
window.goToPage = goToPage
/*const alert = GrooveBoard.alert(
    "Welcome back :)",
    "You've successfully updated your launcher.",
    [{ title: "Next", style: "default",inline: true, action: () => { } }]
);*/
//alert.querySelector("button").style.visibility = "hidden"

function finishSetup() {

}

const accessibility_scroller = new GrooveScroll("#page-access div.scroller", {
    scrollbar: true

})
const accent_color_scroller = new GrooveScroll("div.accent-color-catalogue", {
    scrollbar: true

})
const permissions_scroller = new GrooveScroll("#page-permissions div.scroller", {
    scrollbar: true

})
const whats_new_scroller = new GrooveScroll("#page-readme div.scroller", {
    scrollbar: true

})

$("div.accent-color-catalogue-item").on("flowClick", function () {
    $("div.accent-color-catalogue-item").removeClass("selected")
    $(this).addClass("selected")
})

var setup = {
    welcome_back: true,
    update_wizard: true,
    accessibility: true,
    pick_accent: true,
    whats_new: true,
    permissions: true
}
const updatedApp = !!localStorage["lastVersion"]
setup.welcome_back = updatedApp
setup.update_wizard = updatedApp && localStorage["lastVersion"] != Groove.getAppVersion()
setup.pick_accent = !!!localStorage["accentColor"]
setup.accessibility = !!!localStorage["theme"] && !!!localStorage["UIScale"]
setup.whats_new = !Groove.getAppVersion().includes("nightly") || BuildConfig["CHANGELOG"]
setup.permissions = !allPermissions.some(e => !Groove.checkPermission(e))

if (updatedApp) {
    document.querySelector("#page-welcome > div.setup-body > h1").innerText = "Welcome back"
    document.querySelector("#page-welcome > div.setup-body > p:nth-child(3)").innerText = "Let’s check a few details to enhance your updated experience."
}
if ((Groove.getWebViewVersion().includes("chrome") || Groove.getAppVersion().includes("nightly")) && BuildConfig["CHANGELOG"] && setup.whats_new) {
    try {
        document.querySelector("#page-readme ul").innerHTML = BuildConfig["CHANGELOG"]().split("{NEWLINE}").map(e => `<li>${e}</li>`).join("")
    } catch (error) {
        setup.whats_new = false
    }
}
var history = []
history.push(0)
document.querySelector("#page-welcome button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.update_wizard) {
        goToPage(1)
    } else if (setup.accessibility) {
        goToPage(3)
        history.push(3)
    } else if (setup.pick_accent) {
        goToPage(4)
        history.push(4)
    } else if (setup.permissions) {
        goToPage(5)
        history.push(5)
    } else if (setup.whats_new) {
        goToPage(6)
        history.push(6)
    } else {
        document.querySelector("#page-readme button.right-btn").dispatchEvent(new Event("flowClick"))
    }
})
document.querySelector("#page-wizard button.left-btn").addEventListener("flowClick", (e) => {
    goToPage(history.slice(-2)[0])
    history.pop()
})
document.querySelector("#page-wizard button.right-btn").addEventListener("flowClick", (e) => {
    goToPage(2);
    setTimeout(() => {
        const loader = document.getElementById("update-loader");

        try {
            updateScript()
        } catch (error) {

        }
        localStorage.setItem("lastVersion", Groove.getAppVersion())

        loader.classList.add("finished");
        document.querySelector("#update-loading p").innerText = "All done!"
        document.querySelector("#update-loader").remove()
        document.querySelector("#update-loading div.setup-footer").style.removeProperty("display")
        $("#update-loading").addClass("active").addClass("button-anim")
        setup.update_wizard = false
        history = history.filter(e => e != 1 || e != 2)
        setTimeout(() => {

            $("#update-loading").removeClass("button-anim")
        }, 500);
    }, 2000);

})

document.querySelector("#update-loading button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.accessibility) {
        goToPage(3)
        history.push(3)
    } else if (setup.pick_accent) {
        goToPage(4)
        history.push(4)
    } else if (setup.permissions) {
        goToPage(5)
        history.push(5)
    } else if (setup.whats_new) {
        goToPage(6)
        history.push(6)
    } else {
        document.querySelector("#page-readme button.right-btn").dispatchEvent(new Event("flowClick"))
    }
})
document.querySelector("#page-access button.left-btn").addEventListener("flowClick", (e) => {

    goToPage(history.slice(-2)[0])
    history.pop()

})
document.querySelector("#page-access button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.pick_accent) {
        goToPage(4)
        history.push(4)
    } else if (setup.permissions) {
        goToPage(5)
        history.push(5)
    } else if (setup.whats_new) {
        goToPage(6)
        history.push(6)
    } else {
        document.querySelector("#page-readme button.right-btn").dispatchEvent(new Event("flowClick"))
    }
})
document.querySelector("#accent-color-picker button.left-btn").addEventListener("flowClick", (e) => {
    goToPage(history.slice(-2)[0])
    history.pop()

})
document.querySelector("#accent-color-picker button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.permissions) {
        goToPage(5)
        history.push(5)
    } else if (setup.whats_new) {
        goToPage(6)
        history.push(6)
    } else {
        document.querySelector("#page-readme button.right-btn").dispatchEvent(new Event("flowClick"))
    }
})
document.querySelector("#page-permissions button.left-btn").addEventListener("flowClick", (e) => {
    goToPage(history.slice(-2)[0])
    history.pop()

})
document.querySelector("#page-permissions button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.whats_new) {
        goToPage(6)
        history.push(6)
    } else {
        document.querySelector("#page-readme button.right-btn").dispatchEvent(new Event("flowClick"))
    }
})
document.querySelector("#page-readme button.left-btn").addEventListener("flowClick", (e) => {
    goToPage(history.slice(-2)[0])
    history.pop()

})
document.querySelector("#page-readme button.right-btn").addEventListener("flowClick", (e) => {
    if (GrooveBoard.backendMethods.setupNeeded()) {
        localStorage.setItem("lastVersion", Groove.getAppVersion())
    }
    if (!localStorage["homeConfiguration"]) {
        try {
            const defaultApps = JSON.parse(Groove.getDefaultApps())
            const searchApps = {
                "phoneApp": [0, 0, 2, 2],
                "messageApp": [2, 0, 1, 1],
                "browserApp": [3, 0, 1, 1],
                "mailApp": [2, 1, 1, 1],
                "storeApp": [3, 1, 1, 1],
                "contactsApp": [0, 2, 2, 2],
                "musicApp": [2, 2, 2, 2],
                "galleryApp": [0, 4, 4, 2]
            }
            var homeConfiguration = []
            Object.keys(searchApps).forEach(element => {
                try {
                    const appdetail = GrooveBoard.backendMethods.getAppDetails(defaultApps[element])
                    const app = searchApps[element]
                    if (appdetail.label == "Unknown") throw new Error("App not found for ", element);

                    homeConfiguration.push({
                        "p": appdetail.packageName,
                        "t": appdetail.label,
                        "ii": false,
                        "i": appdetail.icon.foreground,
                        "ib": appdetail.icon.background,
                        "s": [
                            "s",
                            "m",
                            "w"
                        ],
                        "w": app[2],
                        "h": app[3],
                        "x": app[0],
                        "y": app[1]
                    })

                } catch (error) {

                }
            });
            localStorage["homeConfiguration"] = JSON.stringify(homeConfiguration)
        } catch (error) {
        }
    }
    goToPage(7);
    setTimeout(() => {
        if (GrooveBoard.backendMethods.setupNeeded()) {
            GrooveBoard.alert("Setup Error", "Something went wrong while setting up. Please try again.", [{
                title: "Retry", style: "default", action: () => {
                    window.location.reload()
                }
            }, { title: "Cancel", style: "default", action: () => { } }])
        } else {
            goToPage(7)

            setTimeout(() => {
                location.href = new URL("./index.html", location).href
            }, 500);
        }

    }, 2000);
})
setTimeout(() => {
    // goToPage(3)
}, 500);

// Reduce motion toggle
document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    GrooveBoard.backendMethods.setReduceMotion(e.target.hasAttribute("checked"))
})

// High contrast toggle
document.querySelector("div.high-contrast-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    GrooveBoard.backendMethods.setHighContrast(e.target.hasAttribute("checked"))
})

// Haptic feedback toggle
document.querySelector("div.haptic-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    localStorage.setItem("hapticFeedback", e.target.hasAttribute("checked"))
    if (e.target.hasAttribute("checked")) {
        Groove.triggerHapticFeedback("ENABLED")
    } else {
        Groove.triggerHapticFeedback("DISABLED")
    }
})

// Theme chooser (update to include auto option)
document.getElementById("theme-chooser").addEventListener('selected', (e) => {
    const themes = [grooveThemes.light, grooveThemes.dark, grooveThemes.auto]
    GrooveBoard.backendMethods.setTheme(themes[e.detail.index])
});

document.getElementById("display-scaling-chooser").addEventListener("selected", (e) => {
    const options = [.8, .9, 1, 1.1, 1.25]
    GrooveBoard.backendMethods.setUIScale(options[e.detail.index])
})
document.querySelectorAll("div.accent-color-catalogue-item").forEach(e => e.addEventListener("flowClick", (e) => {
    GrooveBoard.backendMethods.setAccentColor(grooveColors[e.target.style.background.slice(18).slice(0, -1)])
}))
if (!!localStorage.getItem("tileColumns")) GrooveBoard.backendMethods.setTileColumns(Number(localStorage.getItem("tileColumns")), true)
if (!!localStorage.getItem("theme")) GrooveBoard.backendMethods.setTheme(Number(localStorage.getItem("theme")), true)
if (!!localStorage.getItem("accentColor")) GrooveBoard.backendMethods.setAccentColor(localStorage.getItem("accentColor"), true)

// Initialize toggle states from localStorage
setTimeout(() => {
    if (localStorage["reducedMotion"] == "true") {
        document.querySelector("div.reduce-motion-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
        document.body.classList.add("reduced-motion")
    }
    if (localStorage["highContrast"] == "true") {
        document.querySelector("div.high-contrast-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.high-contrast-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
        document.body.classList.add("high-contrast")
    }
    if (localStorage.getItem("hapticFeedback") != "false") {
        document.querySelector("div.haptic-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.haptic-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
    }
}, 500);

i18n.translateDOM();

const welcomeTitle = document.querySelector("#page-welcome > div.setup-body > h1")
const firstWelcome = localStorage["lastVersion"] ? !localStorage.lastVersion == Groove.getAppVersion() : true
const welcomeType = firstWelcome ? "welcome.welcome.install" : "welcome.welcome.update"

console.log("updatedapp", updatedApp)
window.firstWelcome = firstWelcome
var welcomei = 0
welcomeTitle.innerText = i18n.t(welcomeType)
function startFlipping() {
    if (!!localStorage.getItem("UIScale")) GrooveBoard.backendMethods.setUIScale(Number(localStorage.getItem("UIScale")), true); else GrooveBoard.backendMethods.setUIScale(.8, true)

    setTimeout(() => {
        setTimeout(() => {
            if (isChristmas()) snowStorm.start()
        }, 1000);
        setInterval(() => {
            welcomei++;
            welcomeTitle.style.animation = "none"
            welcomeTitle.classList.add(welcomei % 2 == 0 ? "flip2" : "flip")
            setTimeout(() => {
                welcomeTitle.removeAttribute("data-i18n")
                welcomeTitle.innerText = welcomei % 2 == 0 ?
                    i18n.t(welcomeType) :
                    (greetings.getRandomWelcome()[firstWelcome ? "welcome" : "welcome_back"] || (firstWelcome ? "Welcome" : "Welcome back"));
            }, 200);
            setTimeout(() => {
                welcomeTitle.classList.remove("flip", "flip2")
            }, 2000);
        }, 4000);
    }, 200);
}

import { isChristmas, snowStorm } from "./scripts/fun/snow.js";
import { set } from "lodash";


function updateScript() {
    if (olderThan("0.5.0-beta.5")) {
        if (localStorage["UIScale"]) {
            if (localStorage["UIScale"] == "1") GrooveBoard.backendMethods.setUIScale(0.8)
        } else {
            GrooveBoard.backendMethods.setUIScale(0.8)
        }
    }
}
const loaderText = document.querySelector("#loader p.loader-text")
function updateLoaderText(string) {
    loaderText.style.removeProperty("animation")
    if (window.updateLoaderText_t2) loaderText.innerText = string

    requestAnimationFrame(() => {
        loaderText.style.setProperty("animation", "loader-text-flip 1s")
        clearTimeout(window.updateLoaderText_t1)
        clearTimeout(window.updateLoaderText_t2)

        window.updateLoaderText_t1 = setTimeout(() => {
            loaderText.innerText = string
        }, 200);
        window.updateLoaderText_t2 = setTimeout(() => {
            loaderText.style.removeProperty("animation")
            delete window.updateLoaderText_t1
            delete window.updateLoaderText_t2
        }, 1000);
    })
}
window.updateLoaderText = updateLoaderText
function finishLocale() {
    setTimeout(() => {
        document.querySelector("#loader").classList.add("finished")
        setTimeout(() => {
            document.querySelector("#loader").remove()
            startFlipping()
            document.body.classList.add("animate-intro")
        }, 500);
    }, 2000);
}
if (firstWelcome && localStorage["welcomeLocalesDownloaded"] != "true") {
    //document.querySelector("#loader").classList.add("first-welcome")
    //document.body.classList.add("animate-intro")

    const systemLocale = Groove.getSystemLocale().replaceAll("_", "-");
    var localesFinished = false
    var localeProceed = true
    setTimeout(async () => {
        if (!BuildConfig.signed()) {
            updateLoaderText("")
            finishLocale()
            return;
        }
        updateLoaderText("Querying locales...")
        var userLocales = {}
        if (!localeProceed) return
        userLocales = (await i18n.getAvailableLocales()).userLocales
        if (!localeProceed) return
        if (!Object.keys(userLocales).length) {
            //error locales oculdnt be fetched
            updateLoaderText("Error: Locales couldn't be fetched.")
            finishLocale()
            return;
        }
        if (!localeProceed) return
        var foundLocale = Object.entries(userLocales).filter(e =>
            e[1].language.androidCode.replaceAll("_", "-") == systemLocale || e[1].language.id.replaceAll("_", "-") == systemLocale || e[1].language.locale.replaceAll("_", "-") == systemLocale
        )
        if (!foundLocale.length) {
            updateLoaderText("Error: System locale not found.")
            finishLocale()
            return;
        } else {
            foundLocale = foundLocale[0][1].languageId
        }
        if (!localeProceed) return
        updateLoaderText("Downloading locales...")
        i18n.setLocale(foundLocale, (progress) => {
            switch (progress.status) {
                case 'downloading':
                    //show total progress => progress.totalProgress
                    updateLoaderText(`Downloading locales... ${progress.totalProgress}%`)
                    break;
                case 'error':
                    //no error code
                    updateLoaderText("Error: Locales couldn't be downloaded.")
                    break;
                case 'complete':
                    //locales downloaded
                    localesFinished = true
                    updateLoaderText("Locales downloaded.")
                    localStorage["welcomeLocalesDownloaded"] = "true"
                    finishLocale()
                    break;
            }
        });

    }, 750);
    setTimeout(() => {
        if (!localesFinished) {
            localeProceed = false
            updateLoaderText("Timeout: Proceeding with default locale...")
            finishLocale()
        }
    }, 15000);



} else {
    document.querySelector("#loader").classList.add("finished")
    setTimeout(() => {
        document.querySelector("#loader").remove()
        startFlipping()
        document.body.classList.add("animate-intro")
    }, 500);

}
document.querySelectorAll("div.permission-group").forEach((e, index) => {
    console.log(index)
    function interval() {
        const granted = Groove.checkPermission(allPermissions[index]) == "true"
        if (granted) {
            e.querySelector("button").style.display = "none"
            e.querySelector("span.permission-icon").innerText = "󰄬"
            e.querySelector("span.permission-icon").classList.add("checked")
        } else {
            e.querySelector("button").style.display = "block"
            e.querySelector("span.permission-icon").innerText = ""
            e.querySelector("span.permission-icon").classList.remove("checked")
        }
    }
    e.querySelector("button").addEventListener("flowClick", () => {
        if (allPermissions[index] == "ACCESSIBILITY") {
            const alert = GrooveBoard.alert("Enable Double-Tap to Lock", "This feature needs Accessibility permission to lock your screen with a double-tap. Do you want to enable it?", [
                {
                    title: "Accept",
                    action: () => {
                        Groove.requestPermission(allPermissions[index])
                    }
                },
                {
                    title: "Decline"
                }
            ], true)
        } else {
            Groove.requestPermission(allPermissions[index])
        }
        console.log(index, allPermissions[index])
    })
    setInterval(interval, 1000)
    interval()
})
GrooveBoard.backendMethods.setUIScale(1, true)
Groove.appReady()
