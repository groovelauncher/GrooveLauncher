import iconPackConverter from "./scripts/iconPack.js";
import { newerThan, olderThan, compareVersions } from "./scripts/versioning.js";
window.newerThan = newerThan
window.olderThan = olderThan
window.compareVersions = compareVersions
import jQuery from "jquery";
window.$ = jQuery
import { i18n, greetings } from './scripts/localeManager';
await i18n.init();
window.i18n = i18n;
window.greetings = greetings

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
}
const updatedApp = !!localStorage["lastVersion"]
setup.welcome_back = updatedApp
setup.update_wizard = updatedApp && localStorage["lastVersion"] != Groove.getAppVersion()
setup.pick_accent = !!!localStorage["accentColor"]
setup.accessibility = !!!localStorage["theme"] && !!!localStorage["UIScale"]
if (updatedApp) {
    document.querySelector("#page-welcome > div.setup-body > h1").innerText = "Welcome back"
    document.querySelector("#page-welcome > div.setup-body > p:nth-child(3)").innerText = "Let’s check a few details to enhance your updated experience."
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
    } else if (setup.whats_new) {
        goToPage(5)
        history.push(5)
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
    } else if (setup.whats_new) {
        goToPage(5)
        history.push(5)
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
    } else if (setup.whats_new) {
        goToPage(5)
        history.push(5)
    }
})
document.querySelector("#accent-color-picker button.left-btn").addEventListener("flowClick", (e) => {
    goToPage(history.slice(-2)[0])
    history.pop()

})
document.querySelector("#accent-color-picker button.right-btn").addEventListener("flowClick", (e) => {
    if (setup.whats_new) {
        goToPage(5)
        history.push(5)
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
    goToPage(6);
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
                location.href = new URL("./", location).href
            }, 500);
        }

    }, 2000);
})
setTimeout(() => {
    // goToPage(3)
}, 500);

document.getElementById("theme-chooser").addEventListener('selected', (e) => {
    GrooveBoard.backendMethods.setTheme(e.detail.index == 0 ? grooveThemes.light : grooveThemes.dark)
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
GrooveBoard.backendMethods.setUIScale(1, true)
Groove.appReady()
