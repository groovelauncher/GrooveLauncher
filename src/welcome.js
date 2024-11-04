import iconPackConverter from "./scripts/iconPack.js";
import jQuery from "jquery";
window.$ = jQuery
import GrooveMock from "./scripts/GrooveMock.js";

const GrooveMockInstance = !window.Groove
window.GrooveMockInstance = GrooveMockInstance
if (GrooveMockInstance) {
    window.Groove = new GrooveMock("./mock/apps.json")
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
        loader.classList.add("finished");
        document.querySelector("#update-loading p").innerText = "All done!"
        document.querySelector("#update-loading div.setup-footer").style.removeProperty("display")
        $("#update-loading").addClass("active").addClass("button-anim")
        localStorage.setItem("lastVersion", Groove.getAppVersion())
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
                location.href = !GrooveMockInstance ? '/assets/index.html' : '/www'
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
if (!!localStorage.getItem("UIScale")) GrooveBoard.backendMethods.setUIScale(Number(localStorage.getItem("UIScale")), true)
