import { applyOverscroll, appViewEvents, grooveColors, grooveThemes, setAccentColor } from "../../scripts/shared/internal-app";
import BScroll from "better-scroll";

window.grooveColors = grooveColors
console.log("hey")
const settingsPages = document.getElementById("settings-pages")
const appTabs = document.querySelector("div.app-tabs")
const bs = new BScroll("#settings-pages", {
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
window.bs = bs
var lastX = 0
const allTabs = document.querySelectorAll("div.app-tabs > p")
const allPages = [
    document.querySelector("#settings-pages > div > div:nth-child(2)"),
    document.querySelector("#settings-pages > div > div:nth-child(3)"),
    document.querySelector("#settings-pages > div > div:nth-child(4)"),
]
window.allPages = allPages
allPages.forEach(e => e.classList.add("original"))
console.log(allPages)
function activeTabScroll() {
    var x = Math.round(bs.content.getBoundingClientRect().left - 22 + bs.wrapper.offsetWidth)
    x -= document.querySelector("div.innerApp").offsetLeft - 22
    if (x != lastX) {
        //console.log(bs.getCurrentPage().pageX)
        //x += settingsPages.offsetWidth
        var maxscroll = 0
        var scrollEl = []
        allTabs.forEach(e => { maxscroll += e.offsetWidth + 25; scrollEl.push(e.offsetWidth + 25) })
        var scroll = -x / settingsPages.offsetWidth
        if (scroll < 0) scroll += allTabs.length
        var transform = 0
        scrollEl.slice(0, Math.floor(scroll)).forEach(e => transform += e)
        transform += scrollEl[Math.floor(scroll)] * (scroll % 1)
        allTabs.forEach(e => e.classList.remove("active-tab"))
        allPages.forEach(e => e.classList.remove("active-page"))
        try {
            allTabs[Math.floor(scroll + .5)].classList.add("active-tab")
            allPages[Math.floor(scroll + .5)].classList.add("active-page")
        } catch (error) {
            try {
                allTabs[Math.floor(scroll + .5 - allTabs.length)].classList.add("active-tab")
                //allPages[Math.floor(scroll + .5 - allTabs.length)].classList.add("active-page")
            } catch (error) {
                console.log(Math.floor(scroll + .5 - allTabs.length))
            }
        }

        allTabs.forEach((e, index) => {
            var extra = 0
            if (scroll >= (index + 1)) { extra = maxscroll }
            e.style.transform = `translateX(${-transform + extra}px)`
            if (x <= 0) allPages[index].style.transform = scroll >= (index + 1) ? `translateX(${bs.content.offsetWidth - bs.wrapper.offsetWidth * 2}px)` : ""
            // if (x >= 0) allPages[index].style.transform = scroll >= (index + 1) ? `translateX(${bs.content.offsetWidth - bs.wrapper.offsetWidth * 2  + (s.maxScrollX + bs.wrapper.offsetWidth)}px)` : ""

            //console.log(scroll)
        })
        if (x > 0) { allPages.slice(-1)[0].style.transform = `translateX(${-100 * allPages.length}%)` }
        console.log(x, scroll)
        lastX = x
    }
    requestAnimationFrame(activeTabScroll)
}
activeTabScroll()
bs.on('slideWillChange', (page) => {
    // Page about to switch
    //console.log(page.pageX, page.pageY)
})

bs.scroller.animater.hooks.on('time', (duration) => {
    //console.log("time", duration) // 800
    // appTabs.style.setProperty("--duration", duration + "ms")
})
bs.scroller.translater.hooks.on('translate', (point) => {
    //console.log(point) // { x: 0, y: 0 }
    // activeTabScroll(point.x)
})

appTabs.addEventListener("pointerdown", (e) => {
    bs.wrapper.dispatchEvent(new PointerEvent("pointerdown", e))
})
appTabs.addEventListener("pointermove", (e) => {
    bs.wrapper.dispatchEvent(new PointerEvent("pointermove", e))
})
appTabs.addEventListener("pointerup", (e) => {
    bs.wrapper.dispatchEvent(new PointerEvent("pointerup", e))
})

const scrollers = {
    theme: new BScroll("#settings-pages > div > div.settings-page:nth-child(2)", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1
    }),
    about: new BScroll("#settings-pages > div > div.settings-page:nth-child(4)", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1
    }),
    accentCatalogue: new BScroll("div.accent-color-catalogue", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1
    })
}
Object.values(scrollers).forEach(e => applyOverscroll(e))
setTimeout(() => {
    Object.values(scrollers).forEach(e => e.refresh())
}, 600);
document.querySelector("div.first-page > div > div.group > div.picker").addEventListener("flowClick", (e) => {
    console.log("hey")
    if (e.target.classList.contains("clicked")) {
        e.target.classList.remove("clicked")
    } else {
        e.target.classList.add("clicked")
    }
})

window.addEventListener('click', function (event) {
    if (!document.querySelector("div.first-page > div > div.group > div.picker").contains(event.target)) {
        document.querySelector("div.first-page > div > div.group > div.picker").classList.remove("clicked")
    }
});
document.querySelectorAll("div.first-page > div > div.group > div.picker div.picker-option").forEach(e => e.addEventListener("flowClick", (e) => {
    const index = Array.from(e.target.parentNode.children).indexOf(e.target)
    console.log(index)
    setTimeout(() => {
        appViewEvents.setTheme(1 - index)
    }, 200);
    document.querySelector("div.first-page > div > div.group > div.picker").setAttribute("selected", index)
    document.querySelector("div.first-page > div > div.group > div.picker").classList.remove("clicked")
}))
const accentColorPicker = document.getElementById("accent-color-picker")
document.querySelector("div.color-picker").addEventListener("flowClick", (e) => {
    console.log("hey")
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
    document.querySelector("div.color-picker > div.picker-option").innerText = "cobalt"
} else {
    document.querySelector("div.color-picker > div.picker-option").innerText = Object.keys(grooveColors).find(key => grooveColors[key] === "#" + urlParams.get("accentColor"));
}
if (urlParams.has("theme")) {
    document.querySelector("div.first-page > div > div.group > div.picker").setAttribute("selected", urlParams.get("theme") == "light" ? 0 : 1)
}
document.querySelector("#buymeacoffee").addEventListener("flowClick", (e) => {
    Groove.openURL('https://www.buymeacoffee.com/berkaytumal')
})
console.log("dedead")