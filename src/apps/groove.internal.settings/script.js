import { applyOverscroll, appViewEvents, grooveColors, grooveThemes, setAccentColor } from "../../scripts/shared/internal-app";
import { GrooveScroll, GrooveSlide } from "../../scripts/overscrollFramework";
import imageStore from "../../scripts/imageStore";
import fontStore from "../../scripts/fontStore";
import jQuery from "jquery";
import i18n from "../../scripts/localeManager";
window.i18n = i18n
await i18n.init()
await i18n.translateDOM()
const $ = jQuery
window.fontStore = fontStore
const settingsPages = document.getElementById("settings-pages")
const appTabs = document.querySelector("div.innerApp div.app-tabs")

var lastX = 0
const allTabs = document.querySelectorAll("div.innerApp div.app-tabs > p")
const allPages = Array.from(document.querySelectorAll("#settings-pages > div.settings-pages-container > div.settings-page"))
document.querySelectorAll("div.groove-list-view").forEach(listView => {
    var index = 0
    listView.querySelectorAll("div.groove-list-view-item:not(.hidden)").forEach(listViewItem => {
        listViewItem.style.setProperty("--index", index)
        index += 1;
    })
})
const bs = new GrooveSlide("#settings-pages", {
    slide: {
        loop: true,
        speed: 400
    },
})


var scrollStartPageIndex = undefined
var scrollStartX = undefined
bs.on('beforeScrollStart', (e) => {
    scrollStartPageIndex = Math.round(-1 - bs.x / scrollWidth())
    scrollStartX = (-1 - bs.x / scrollWidth())
})
function handlePageAnim(index = 0, next = true, scroll = 0) {
    document.querySelectorAll("div.innerApp > div.app-tabs > p").forEach(e => e.classList.remove("active-tab"))
    document.querySelectorAll("div.innerApp > div.app-tabs > p")[index].classList.add("active-tab")
    document.querySelectorAll("div.settings-pages-container > div.settings-page").forEach(e => e.classList.remove("active-page"))
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].style.setProperty("--page-swipe-translate", (next ? scroll : -scroll) + "px")
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].style.setProperty("--page-swipe-direction", (next ? 1 : -1))
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].classList.add("active-page")
    const maxIndex = document.querySelectorAll("div.settings-pages-container > div.settings-page").length - 1
    console.log("handle page anim", index, maxIndex)
    if (index == 0) {
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[maxIndex].classList.add("active-page")
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[maxIndex].style.setProperty("--page-swipe-translate", (next ? scroll : -scroll) + "px")
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[maxIndex].style.setProperty("--page-swipe-direction", (next ? 1 : -1))
    } else if (index == maxIndex - 2) {
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[0].classList.add("active-page")
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[0].style.setProperty("--page-swipe-translate", (next ? scroll : -scroll) + "px")
        document.querySelectorAll("div.settings-pages-container > div.settings-page")[0].style.setProperty("--page-swipe-direction", (next ? 1 : -1))
    }
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
function applyTabScroll(innerApp) {

}
function activeTabScroll() {
    if (document.body.classList.contains("soft-exit") || document.body.classList.contains("soft-exit-home")) return;
    if (!animPlaying) {
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

            const tabswidth = maxscroll
            allTabs.forEach((e, index) => {
                var extra = 0
                if (scroll >= (index + 1)) { extra = maxscroll }
                e.style.transform = `translateX(${-transform + extra}px)`
                const innerText = e.innerText
                if (`"${innerText}"` != e.style.getPropertyValue("--ats-title")) e.style.setProperty("--ats-title", `"${innerText}"`)
                const innerTextLeft = tabswidth - e.offsetWidth
                if (`${innerTextLeft}px` != e.style.getPropertyValue("--ats-title-left")) e.style.setProperty("--ats-title-left", `${innerTextLeft}px`)
            })
            const [firstPage, lastPage] = [allPages[0], allPages[allPages.length - 1]]
            if (scrollStartX) if (scrollStartX == 0 || scrollStartX == allPages.length - 1) if (scrollStartX == 0) {

            } else {

            }


            //console.log("scroll", scroll, allTabs.length)
            lastX = x
        }
    }
    requestAnimationFrame(activeTabScroll)
}
window.activeTabScroll = activeTabScroll
window.scrollers = {
    home: new GrooveScroll("#home-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    accentColorCatalogue: new GrooveScroll("div.accent-color-catalogue", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: false
    }),
    customColorSelector: new GrooveScroll("div.custom-color-selector", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: false,
        eventPassthrough: "horizontal"
    }),
    apps: new GrooveScroll("#apps-tab:nth-child(3)", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    theme: new GrooveScroll("#theme-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    rotationLock: new GrooveScroll("#rotation-lock-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    language: new GrooveScroll("#language-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    easeOfAccess: new GrooveScroll("#ease-of-access-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
    advanced: new GrooveScroll("#advanced-tab", {
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
    appDetail: new GrooveScroll("#app-detail-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    }),
}
setTimeout(() => {
    Object.values(scrollers).forEach(e => e.refresh())
}, 600);
window.appViewEvents = appViewEvents




function showPageAnim() {
    document.body.classList.add("shown")
    clearTimeout(window.activeTabScrollTimeout)
    setTimeout(() => {
        document.querySelectorAll("div.groove-list-view.skew").forEach(listView => listView.classList.remove("skew"))
    }, 2000 * animationDurationScale);
    window.activeTabScrollTimeout = setTimeout(() => {
        activeTabScroll()
    }, 500 * animationDurationScale);
}


window.animPlaying = false
const navigation = {
    goToPage: (index) => {
        animPlaying = true
        document.querySelector("div.innerApp").classList.remove("shown-page")
        document.querySelector("div.innerApp").classList.add("hidden-page")
        document.querySelectorAll("div.innerAppPage")[index].classList.add("shown-page")
        document.querySelectorAll("div.innerAppPage")[index].classList.remove("hidden-page")
        setTimeout(() => {
            document.querySelector("div.innerApp").style.setProperty("flexGrow", 0)
        }, 150);
        setTimeout(() => {
            document.querySelectorAll("div.innerAppPage")[index].classList.add("shown-page-no-anim")
        }, 750);
        if (window.parent.GrooveBoard) window.parent.GrooveBoard.backendMethods.navigation.push("settings-inner-page", () => { }, () => {
            navigation.settingsHome()
        }, false)
    },

    settingsHome: () => {
        animPlaying = true
        setTimeout(() => {
            animPlaying = false
        }, 1000 * animationDurationScale);
        const beforePage = document.querySelector("div.shown-page")
        document.querySelectorAll("div.shown-page").forEach(e => { e.classList.remove("shown-page"); e.classList.remove("shown-page-no-anim"); })
        beforePage.classList.add("hidden-page")
        setTimeout(() => {
            document.querySelector("div.innerApp").classList.remove("hidden-page")
            document.querySelector("div.innerApp").classList.add("shown-page")
        }, 150);
    }
}
window.pageNavigation = navigation
$("#home-tab > div > div.groove-list-view > div.groove-list-view-item").on("flowClick", e => {
    navigation.goToPage($(e.target).index())
})

window.Groove = window.Groove || window.parent.Groove

import "./pages/00_home+theme"
import "./pages/01_screen_rotation"
import "./pages/02_language"
import "./pages/03_ease_of_access"
import "./pages/04_advanced"
import "./pages/05_about"
import "./pages/10_applications"
//i18n.translateDOM()
requestAnimationFrame(() => {
    showPageAnim()
});
