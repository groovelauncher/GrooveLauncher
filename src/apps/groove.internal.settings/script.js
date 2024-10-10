
import { applyOverscroll, appViewEvents, grooveColors, grooveThemes, setAccentColor } from "../../scripts/shared/internal-app";
import { GrooveScroll, GrooveSlide } from "../../scripts/overscrollFramework";
import imageStore from "../../scripts/imageStore";
import fontStore from "../../scripts/fontStore";
window.fontStore = fontStore
const settingsPages = document.getElementById("settings-pages")
const appTabs = document.querySelector("div.app-tabs")

var lastX = 0
const allTabs = document.querySelectorAll("div.app-tabs > p")
const allPages = Array.from(document.querySelectorAll("#settings-pages > div.settings-pages-container > div.settings-page"))

const bs = new GrooveSlide("#settings-pages", {
    scrollX: true,
    scrollY: false,
    click: true,
    tap: true,
    bounce: false,
    disableMouse: false,
    disableTouch: false,
    momentum: false,
    HWCompositing: false,
    slide: {
        threshold: 100,
        loop: true,
        interval: false,
        autoplay: false,
        easing: "cubic-bezier(0.075, 0.82, 0.165, 1)"
    },
})
var scrollStartPageIndex = undefined
var scrollStartX = undefined
bs.on('beforeScrollStart', (e) => {
    scrollStartPageIndex = Math.round(-1 - bs.x / scrollWidth())
    scrollStartX = (-1 - bs.x / scrollWidth())
})
function handlePageAnim(index = 0, next = true, scroll = 0) {
    document.querySelectorAll("div.app-tabs > p").forEach(e => e.classList.remove("active-tab"))
    document.querySelectorAll("div.app-tabs > p")[index].classList.add("active-tab")
    document.querySelectorAll("div.settings-pages-container > div.settings-page").forEach(e => e.classList.remove("active-page"))
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].style.setProperty("--page-swipe-translate", (next ? scroll : -scroll) + "px")
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].classList.add("active-page")
}
const scrollWidth = () => { return Math.min(window.innerWidth, 768) }
window.scrollWidth = scrollWidth
window.addEventListener("pointermove", () => {
    //  console.log(-window.asfasf - window.innerWidth - bs.x)
})
bs.on('flick', () => {
    const next = (-1 - bs.x / scrollWidth()) > scrollStartX
    var index = next ? (scrollStartPageIndex + 1) : (scrollStartPageIndex - 1)
    index = index < 0 ? allPages.length - 1 : index > (allPages.length - 1) ? 0 : index
    handlePageAnim(index, next, Math.abs(scrollStartX - (-1 - bs.x / scrollWidth())) * scrollWidth() * 2)
})
bs.on('touchEnd', (e) => {
    if (Math.abs(scrollStartX - (-1 - bs.x / scrollWidth())) * scrollWidth() > 100) {
        const next = (-1 - bs.x / scrollWidth()) > scrollStartX
        var index = next ? (scrollStartPageIndex + 1) : (scrollStartPageIndex - 1)
        index = index < 0 ? allPages.length - 1 : index > (allPages.length - 1) ? 0 : index
        handlePageAnim(index, next, Math.abs(scrollStartX - (-1 - bs.x / scrollWidth())) * scrollWidth() * 2)
    }
})
bs.on('scrollEnd', (e) => {
    //console.log("scroll", e.x)
})
allPages.forEach(e => e.classList.add("original"))
document.querySelectorAll("div.settings-page:not(.original)").forEach(e => {
    e.innerHTML = "";
    e.removeAttribute("id")
})

window.bs = bs

// Select the target element where you want to dispatch the events
const targetElement = bs.wrapper
// Event listeners for pointer events
appTabs.addEventListener('pointerdown', (e) => {
    appTabs.pointerDown = [e.x, e.y]
    appTabs.lastX = bs.x
    appTabs.lastPointerDown = [e.x, e.y]

    appTabs.startScrolling = false
});

appTabs.addEventListener('pointermove', (e) => {
    if (appTabs.pointerDown) {
        appTabs.lastPointerDown = [e.x, e.y]
        bs.scrollTo(appTabs.lastX + appTabs.lastPointerDown[0] - appTabs.pointerDown[0], 0, 0)
    }
});

window.addEventListener('pointerup', (e) => {
    if (appTabs.pointerDown) {
        if (Math.hypot(appTabs.pointerDown[0] - appTabs.lastPointerDown[0], appTabs.pointerDown[1] - appTabs.lastPointerDown[1]) <= 10) {
            if (e.target.matches("div.app-tabs > p")) {
                const index = Array.from(document.querySelectorAll("div.app-tabs > p")).indexOf(e.target)
                bs.goToPage(index, 0)
                handlePageAnim(index, true, 0)
            }
        } else {
            var page = Math.round((appTabs.lastX + appTabs.lastPointerDown[0] - appTabs.pointerDown[0]) / -scrollWidth() - 1)
            page = page < 0 ? appTabs.length - 1 : page > (appTabs.length - 1) ? 0 : page
            page = page || 0
            bs.goToPage(page, 0)
            handlePageAnim(page)
        }
    }

    appTabs.pointerDown = false
    appTabs.startScrolling = false
});


window.allPages = allPages
function activeTabScroll() {
    if (document.body.classList.contains("soft-exit") || document.body.classList.contains("soft-exit-home")) return;
    var x = Math.round(bs.content.getBoundingClientRect().left - 22 + bs.wrapper.offsetWidth)
    x -= document.querySelector("div.innerApp").offsetLeft - 22
    if (x != lastX) {
        var maxscroll = 0
        var scrollEl = []
        allTabs.forEach(e => { maxscroll += e.offsetWidth + 25; scrollEl.push(e.offsetWidth + 25) })
        var scroll = -x / settingsPages.offsetWidth
        if (scroll < 0) scroll += allTabs.length
        var transform = 0
        scrollEl.slice(0, Math.floor(scroll)).forEach(e => transform += e)
        transform += scrollEl[Math.floor(scroll)] * (scroll % 1)
        /* allTabs.forEach(e => e.classList.remove("active-tab"))
         allPages.forEach(e => e.classList.remove("active-page"))
         try {
             allTabs[Math.floor(scroll + .5)].classList.add("active-tab")
             allPages[Math.floor(scroll + .5)].classList.add("active-page")
         } catch (error) {
             try {
                 allTabs[Math.floor(scroll + .5 - allTabs.length)].classList.add("active-tab")
                 //allPages[Math.floor(scroll + .5 - allTabs.length)].classList.add("active-page")
             } catch (error) {
             }
         }*/

        allTabs.forEach((e, index) => {
            var extra = 0
            if (scroll >= (index + 1)) { extra = maxscroll }
            e.style.transform = `translateX(${-transform + extra}px)`
            //   if (x <= 0) allPages[index].style.transform = scroll >= (index + 1) ? `translateX(${bs.content.offsetWidth - bs.wrapper.offsetWidth * 2}px)` : ""
        })
        //  if (x > 0) { allPages.slice(-1)[0].style.transform = `translateX(${-100 * allPages.length}%)` }
        lastX = x
    }
    requestAnimationFrame(activeTabScroll)
}
window.activeTabScroll = activeTabScroll
const scrollers = {
    theme: new GrooveScroll("#theme-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    about: new GrooveScroll("#about-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    accentCatalogue: new GrooveScroll("div.accent-color-catalogue", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        HWCompositing: false
    })
}
setTimeout(() => {
    Object.values(scrollers).forEach(e => e.refresh())
}, 600);
const accentColorPicker = document.getElementById("accent-color-picker")
document.querySelector("div.color-picker").addEventListener("flowClick", (e) => {
    clearTimeout(window.accentColorPickerTimeout)
    accentColorPicker.classList.add("shown-animation", "shown")
})
document.querySelectorAll("div.accent-color-catalogue-item").forEach(e => e.addEventListener("flowClick", (e) => {
    clearTimeout(window.accentColorPickerTimeout)
    accentColorPicker.classList.remove("shown")
    accentColorPicker.classList.add("hidden")
    window.accentColorPickerTimeout = setTimeout(() => {
        accentColorPicker.classList.remove("shown-animation", "hidden")

    }, 500);
    appViewEvents.setAccentColor(grooveColors[e.target.style.background.slice(18).slice(0, -1)])
    document.querySelector("div.color-picker > div.picker-option").innerText = e.target.style.background.slice(18).slice(0, -1)
}))
window.appViewEvents = appViewEvents
const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.has("accentColor")) {
    document.querySelector("div.color-picker > div.picker-option").innerText = "violet"
} else {
    document.querySelector("div.color-picker > div.picker-option").innerText = Object.keys(grooveColors).find(key => grooveColors[key] === "#" + urlParams.get("accentColor"));
}
if (urlParams.has("theme")) {
    document.querySelector("#theme-chooser").setAttribute("selected", urlParams.get("theme") == "light" ? 0 : 1)
}

document.querySelector("#buymeacoffee").addEventListener("flowClick", (e) => {
    Groove.openURL('https://www.buymeacoffee.com/berkaytumal')
})


document.querySelector("#device-placeholder > svg:nth-child(2)").classList.remove("selected")
document.querySelector("#device-placeholder > svg:nth-child(3)").classList.remove("selected")
if (urlParams.has("tileColumns")) {
    document.querySelector("div.tile-selector > p").innerText = urlParams.get("tileColumns") == "4" ? "Off" : "On"
    if (urlParams.get("tileColumns") != "4") {
        document.querySelector("#tile-toggle-switch").setAttribute("checked", "")
        document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
    } else {
        document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
    }
}
document.querySelector("#tile-toggle-switch").addEventListener("checked", (e) => {
    document.querySelector("#device-placeholder > svg:nth-child(2)").classList.remove("selected")
    document.querySelector("#device-placeholder > svg:nth-child(3)").classList.remove("selected")
    document.querySelector("div.tile-selector > p").innerText = e.target.hasAttribute("checked") ? "On" : "Off"
    appViewEvents.setTileColumns(e.target.hasAttribute("checked") ? 6 : 4)
    if (e.target.hasAttribute("checked")) {
        document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
    } else {
        document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
    }
})
document.querySelector("#tile-toggle-switch").addEventListener("pointerdown", (e) => {
    bs.cancelScroll()
})
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
document.querySelector("#dumpbtn").addEventListener("flowClick", () => {
    navigator.clipboard.writeText(JSON.stringify(window.parent.allappsarchive));
})
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
document.getElementById("theme-chooser").addEventListener('selected', (e) => {
    appViewEvents.setTheme(e.detail.index == 0 ? grooveThemes.light : grooveThemes.dark)
});


function handleFileInput(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const fontData = new Uint8Array(e.target.result);
            fontStore.saveFont(file.name, fontData).then(() => {
                //alert('Font saved successfully!');
                document.getElementById("font-chooser").selectOption(2)
                parent.GrooveBoard.backendMethods.font.set(2)
                document.getElementById("clearfont").style.visibility = "visible"
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"
                lastX = -9999
                setTimeout(() => {
                    lastX = -9999
                }, 100);
            });
        };

        reader.onerror = function () {
            parent.GrooveBoard.alert(
                "Can’t load font",
                "We couldn’t read the font file. Only .ttf fonts are supported. Please try a different file.",
                [, { title: "Ok", style: "default", inline: true, action: () => { } }]
            );
        };

        reader.readAsArrayBuffer(file);
    } else {
        parent.GrooveBoard.alert(
            "Unsupported file format",
            "The font file isn’t valid. Make sure it’s a .ttf file and try uploading again.",
            [, { title: "Ok", style: "default", inline: true, action: () => { } }]
        );
    }
}

// Attach the event listener to the file input
document.getElementById("display-scaling-chooser").addEventListener("selected", (e) => {
    const options = [.8, .9, 1, 1.1, 1.25]
    appViewEvents.setUIScale(options[e.detail.index])
})
document.getElementById("font-chooser").addEventListener("selected", (e) => {
    const index = e.detail.index
    const lastOne = index == document.getElementById("font-chooser").children.length - 1
    if (lastOne) {
        fontStore.hasFont().then(value => {
            if (value) {
                parent.GrooveBoard.backendMethods.font.set(2)
            } else {
                document.getElementById("font-chooser").selectOption(e.detail.prevIndex)
                document.getElementById("font-chooser").querySelector("input").dispatchEvent(new MouseEvent("click"))
            }
        })
    } else {
        parent.GrooveBoard.backendMethods.font.set(index)
    }
    lastX = -9999
    setTimeout(() => {
        lastX = -9999
    }, 100);
})
requestAnimationFrame(() => {
    if (!!localStorage.getItem("UIScale")) {
        const uiscale = Number(localStorage.getItem("UIScale"))
        document.getElementById("display-scaling-chooser").selectOption(uiscale == .8 ? 0 : uiscale == .9 ? 1 : uiscale == 1 ? 2 : uiscale == 1.1 ? 3 : 4)
    }
    if (!!localStorage.getItem("theme")) {
        const theme = Number(localStorage.getItem("theme"))
        document.getElementById("theme-chooser").selectOption(1 - theme)
    }
    if (!!localStorage.getItem("font")) {
        const font = Number(localStorage.getItem("font"))
        document.getElementById("font-chooser").selectOption(font)
        setFont(font)
        fontStore.hasFont().then((value) => {
            if (value) {
                document.getElementById("clearfont").style.visibility = "visible"
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"

            } else {
                document.getElementById("clearfont").style.visibility = "hidden"
            }
        });
    }

    document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())
})
document.getElementById("font-chooser").querySelector("input").addEventListener('change', handleFileInput);
document.getElementById("clearfont").addEventListener("flowClick", () => {
    fontStore.clearFont()
    document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = "choose..."
    document.getElementById("clearfont").style.visibility = "hidden"
    setFont(0)
    document.getElementById("font-chooser").selectOption(0)
    parent.GrooveBoard.backendMethods.font.set(0)
    lastX = -9999
    setTimeout(() => {
        lastX = -9999
    }, 100);
})

document.getElementById("choose-wallpaper").querySelector("input").addEventListener('change', (event) => {
    window.parent.canPressHomeButton = false
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                document.getElementById("remove-wallpaper").style.removeProperty("visibility")

                window.parent.GrooveBoard.backendMethods.wallpaper.load(img)
            };
            document.getElementById("wallpaper-thumbnail").style.backgroundImage = `url(${e.target.result})`
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("choose-wallpaper").addEventListener("flowClick", (e) => {
    window.canPressHomeButton = false
    e.target.querySelector("input").dispatchEvent(new MouseEvent("click"))

})
const detectWallpaper = async () => {

    if (await imageStore.hasImage("wallpaper")) {
        document.getElementById("wallpaper-thumbnail").style.backgroundImage = `url(${window.parent.lastClippedWallpaper})`

    } else {

        document.getElementById("remove-wallpaper").style.visibility = "hidden";
    }
}
detectWallpaper();

document.getElementById("remove-wallpaper").addEventListener("flowClick", (e) => {
    document.getElementById("wallpaper-thumbnail").style.removeProperty("background-image")
    document.getElementById("remove-wallpaper").style.visibility = "hidden"
    window.parent.GrooveBoard.backendMethods.wallpaper.remove()

})
document.querySelector(".innerApp").style.animation = "app-intro-animation .5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards, app-intro-skew .5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards"
setTimeout(() => {
    activeTabScroll()
}, 500);

const pmtryagaian = {
    root: () => {
        var firstanswer = Groove.isDeviceRooted()
        setTimeout(() => {
            var secondanswer = Groove.isDeviceRooted()
            if (secondanswer) {
                parent.GrooveBoard.backendMethods.packageManagerProvider.set(1)
            } else {
                parent.GrooveBoard.alert(
                    "Root Access Required",
                    "Root access is required to perform this action. Please grant root access to continue.",
                    [{
                        title: "Try again", style: "default", inline: true, action: () => {
                            pmtryagaian.root()
                        }
                    }, { title: "Ok", style: "default", inline: true, action: () => { } }]
                );
                document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())
            }
        }, 1000);
    },
    shizuku: () => {
        var firstanswer = Groove.isShizukuAvailable()
        setTimeout(() => {
            var secondanswer = Groove.isShizukuAvailable()
            if (secondanswer) {
                parent.GrooveBoard.backendMethods.packageManagerProvider.set(2)
            } else {
                parent.GrooveBoard.alert(
                    "Shizuku Permission Required",
                    "Shizuku permission is required to perform this action. Please grant Shizuku permission to continue.",
                    [{
                        title: "Try again", style: "default", inline: true, action: () => {
                            pmtryagaian.shizuku()
                        }
                    }, { title: "Ok", style: "default", inline: true, action: () => { } }]
                );
                document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())
            }
        }, 1000);
    }
}
document.getElementById("pm-chooser").addEventListener('selected', (e) => {
    switch (e.detail.index) {
        case 0:
            parent.GrooveBoard.backendMethods.packageManagerProvider.set(0)
            break;
        case 1:
            pmtryagaian.root()
            break;
        case 2:
            pmtryagaian.shizuku()
            break;
    }
});

document.querySelectorAll("div.credit-item > p:nth-child(2)").forEach(e => e.addEventListener("flowClick", function (event) {
    Groove.openURL(e.getAttribute("url"))
}))