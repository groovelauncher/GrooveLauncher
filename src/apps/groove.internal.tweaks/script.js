const windowInsets = () => ({ top: 0, left: 0, right: 0, bottom: 0 })
import { applyOverscroll, appViewEvents, grooveColors, grooveThemes, setAccentColor } from "../../scripts/shared/internal-app";
import imageStore from "../../scripts/imageStore";
import { GrooveScroll, GrooveSlide } from "../../scripts/overscrollFramework";
import fontStore from "../../scripts/fontStore";
import jQuery from "jquery";
import i18n from "../../scripts/localeManager";
import GrooveElements from "../../scripts/GrooveElements";
const emptyResponses = [
    "Wow, it sure is quite lonely here!",
    "Feels a bit quiet in this space.",
    "Looks like there’s no one around.",
    "Kind of quiet here, huh?",
    "Feels a little empty right now.",
    "Not much happening here, is there?",
    "Looks like you’re on your own for now.",
    "Seems a bit deserted in this spot.",
    "Feels a bit lonesome here.",
    "It's pretty quiet around here."
]
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
    if (index == 0) {
        appBar.setState(1)
        //appBar.style.display = "block"
        //appBar2.setState(0)
        //appBar2.style.display = "none"
    } else {
        appBar.setState(0)
        //appBar.style.display = "none"
        //appBar2.setState(1)
        //appBar2.style.display = "block"
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
    styles: new GrooveScroll("#styles-tab", {
        bounceTime: 300,
        swipeBounceTime: 200,
        outOfBoundaryDampingFactor: 1,
        scrollbar: true
    })
}
setTimeout(() => {
    Object.values(scrollers).forEach(e => e.refresh())
}, 600);
window.appViewEvents = appViewEvents




function showPageAnim() {
    document.body.classList.add("shown")
    clearTimeout(window.activeTabScrollTimeout)
    document.querySelectorAll("div.groove-list-view.skew").forEach(listView => listView.classList.remove("skew"))
    setTimeout(() => {
        document.querySelectorAll("div.groove-list-view.skew").forEach(listView => listView.classList.remove("skew"))
    }, 2000 * animationDurationScale);
    window.activeTabScrollTimeout = setTimeout(() => {
        activeTabScroll()
    }, 500 * animationDurationScale);
    document.querySelector("#splashscreen").classList.add("shown")
    setTimeout(() => {
        document.querySelector("div.innerApp").style.removeProperty("visibility")
        document.querySelector("div.innerApp").classList.add("shown")
        document.querySelector("#splashscreen").remove()
        try {
            appBar.setState(1)
        } catch (error) {

        }
    }, 1000);
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
$("#styles-tab > div > div.groove-list-view > div.groove-list-view-item").on("flowClick", e => {
    navigation.goToPage($(e.target).index())
})

window.Groove = window.Groove || window.parent.Groove

//i18n.translateDOM()
requestAnimationFrame(() => {
    showPageAnim()
});
import styleManager from "../../scripts/styleManager";
const styleManagerInstance = new styleManager();
window.styleManagerInstance = styleManagerInstance
if (new URL(location.href).searchParams.get("launchArgs") != null) {
    const launchArgs = new URL("groove:?" + new URL(location.href).searchParams.get("launchArgs").replaceAll("\"", ""))
    console.log(launchArgs)
    setTimeout(() => {
        if (launchArgs.searchParams.get("installStyle")) {
            console.log("installing style", launchArgs.searchParams.get("installStyle"))
            fetch(decodeURIComponent(launchArgs.searchParams.get("installStyle")))
                .then(response => response.text())
                .then(cssText => {

                    console.log("css", cssText)


                    // Regular expressions to extract metadata
                    const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
                    const authorMatch = cssText.match(/\/\* author: (.*?) \*\//);
                    const iconMatch = cssText.match(/\/\* icon: (.*?) \*\//);
                    const descriptionMatch = cssText.match(/\/\* description: (.*?) \*\//);

                    let metadata = {
                        title: titleMatch ? titleMatch[1] : 'No title',
                        author: authorMatch ? authorMatch[1] : 'No author',
                        icon: iconMatch ? iconMatch[1] : 'No icon',
                        description: descriptionMatch ? descriptionMatch[1] : 'No description',
                    };
                    const flyout = document.createElement("div")
                    flyout.classList.add("install-flyout")
                    const author = metadata.author.match(/\[(.*?)\]\((.*?)\)/);
                    const authorHTML = author ? author[1] : metadata.author;

                    flyout.innerHTML = `
                <div class="install-flyout-inner">
                <img class="install-flyout-icon" src="${metadata.icon}">
                <p class="install-flyout-title">${metadata.title}</p>
                <p class="install-flyout-author">${authorHTML}</p>
                <p class="install-flyout-description">${metadata.description}</p>
                <button class="install-flyout-install">Install</button>
                </div>
                `
                    if (author) {
                        flyout.querySelector("p.install-flyout-author").addEventListener("click", () => {
                            parent.GrooveBoard.alert("External Link Warning", "This link opens up an external website. Proceed with caution.", [{
                                title: "Proceed", style: "default", action: () => {
                                    Groove.openURL(author[2])
                                }
                            }, { title: "Cancel", style: "default", action: () => { } }])
                        })
                    }
                    window.parent.GrooveBoard.backendMethods.navigation.push("appMenuOpened", () => { }, () => {
                        flyout.classList.add("hidden")
                        setTimeout(() => {
                            flyout.remove()
                        }, 500);
                    })
                    flyout.querySelector("button.install-flyout-install").addEventListener("click", async (e) => {
                        e.target.innerText = "Installing..."
                        try {
                            styleManagerInstance.installStyle(cssText)
                            flyout.remove()
                            parent.GrooveBoard.alert("Style Installed", "The style has been installed successfully.", [{
                                title: "OK", style: "default", action: () => {
                                    refreshList();
                                    window.parent.GrooveBoard.backendMethods.refreshStyles();
                                }
                            }])
                            refreshList()
                            window.parent.GrooveBoard.backendMethods.refreshStyles()
                        } catch (error) {
                            parent.GrooveBoard.alert("Error", "An error occurred while installing the style. Please try again later.", [{ title: "OK", style: "default", action: () => { } }])

                        }

                    })
                    document.body.appendChild(flyout)
                    console.log("metadata", metadata)
                })
                .catch(error => console.error('Error loading CSS:', error));
        }
    }, 1000);

    //alert("aldım bak")

}

function appMenuClean() {
    parent.GrooveBoard.backendMethods.navigation.invalidate("tweaksContextMenuOn")

    clearTimeout(window.appMenuCreationFirstTimeout)
    clearTimeout(window.appMenuCreationSecondTimeout)
    $("div.innerApp").removeClass("app-menu-back-intro")
    $("div.groove-list-view-item").css("visibility", "")
    $("div.app-tile-clone").remove()
}
function appImmediateClose() {
    $("div.groove-list-view-item").each((index, element) => {
        if (element["appMenuState"] == false) {
            if (element["appMenu"]) element["appMenu"].remove()
            delete element["appMenuState"]
            delete element["appMenu"]
            delete element["appRect"]
            appMenuClean()

        }
    })
}
scrollers.styles.scroller.hooks.on('scrollStart', appImmediateClose)

function contextMenuClose() {
    parent.GrooveBoard.backendMethods.navigation.invalidate("tweaksContextMenuOn")
    clearTimeout(window.contextMenuCreationFirstTimeout)
    clearTimeout(window.contextMenuCreationSecondTimeout)
    $("div.groove-app-menu").remove()
    $("div.innerApp").removeClass("app-menu-back app-menu-back-intro")
    setTimeout(() => {
        appMenuClean()
        //stickyLetter(-scrollers.app_page_scroller.y)
    }, 500);
}
window.contextMenuClose = contextMenuClose
function refreshList(soft = false) {
    console.log("refresh start")
    const metadata = styleManagerInstance.getMetadata()
    const listView = document.querySelector("#styles-tab > div.groove-list-view")
    if (!soft) listView.innerHTML = ""
    if (Object.keys(metadata).length && !soft) {
        Object.entries(metadata).forEach(([id, data]) => {
            const author = (data["author"] || "No author").match(/\[(.*?)\]\((.*?)\)/);
            const authorHTML = author ? author[1] : metadata.author;
            const currentItem = GrooveElements.wListViewItem(
                data["title"] || "No title",
                authorHTML
            )
            currentItem.style_id = id
            //currentItem.addEventListener("flowClick", onItemClick)
            addListItemEventHandlers(currentItem)
            listView.append(currentItem)
            console.log("append")
        })
    } else {
        listView.innerHTML = "<p style='font-size: 30px; font-weight: 200; opacity: .6;'></p>"
        listView.querySelector("p").innerText = emptyResponses[Math.floor(Math.random() * emptyResponses.length)]
    }
    console.log("refresh stop")
}
window.refreshList = refreshList
refreshList()
function createContextMenu(ell) {
    var entries = {}
    if (Object.keys(styleManagerInstance.getMetadata()).length >= 2) entries["move to top"] = () => { }
    entries["remove"] = () => {
        contextMenuClose()
        document.querySelectorAll("div.app-tile-clone").forEach(e => e.remove())
        styleManagerInstance.removeStyle(ell.style_id)
        refreshList()
        ell.remove()
        window.parent.GrooveBoard.backendMethods.refreshStyles()
    }
    const el = GrooveElements.wContextMenu(ell, entries);
    document.querySelector("body").appendChild(el);
    return el;
}
$("div.innerApp").on("flowClick", function (e) {
    if (e.target.classList.contains("app-menu-back") || e.target.classList.contains("app-menu-back-intro")) {
        contextMenuClose()
    }
})
$(window).on("pointerup", function (e) {
    $("div.groove-list-view-item").each((index, element) => {
        if (element["appMenuState"] == false) {
            if (element["appMenu"]) element["appMenu"].remove()
            delete element["appMenuState"]
            delete element["appMenu"]
            delete element["appRect"]
            appMenuClean()
        } else if (element["appMenuState"] == true) {
        }
    })
})
function addListItemEventHandlers(el) {
    el.addEventListener("pointerdown", () => {
        const e = {
            target: el
        }
        el.appMenu = false
        el.appMenuState = false
        el.appRect = e.target.getBoundingClientRect()

        clearTimeout(window.appMenuCreationFirstTimeout)
        clearTimeout(window.appMenuCreationSecondTimeout)
        $("div.groove-app-menu").remove()

        window.appMenuCreationFirstTimeout = setTimeout(() => {
            $("div.innerApp").addClass("app-menu-back-intro")
            const appMenu = createContextMenu(el)
            const optionalTop = (e.target.offsetTop + scrollers.styles.y + 64 + 83 + 5 + 90)
            appMenu.style.top = ((optionalTop + 154 >= window.innerHeight - windowInsets().bottom) ? optionalTop - 64 - 0 : optionalTop) + "px"
            appMenu.style.setProperty("--pointerX", e.pageX /*- $("div.app-list-page").position().left*/ + "px")
            appMenu.classList.add("intro")
            const appClone = e.target.cloneNode(true)
            appClone.setAttribute("style", appClone.getAttribute("style") + "transition-duration: 1s !important;")
            $(appClone).addClass("app-tile-clone").css({
                left: el.appRect.left /*- $("div.app-list-page").position().left*/,
                top: el.appRect.top - 5
            })
            $("body").append(appClone)
            setTimeout(() => {
                appClone.classList.remove("active")
            }, 0);
            el.style.visibility = "hidden"

            if (optionalTop + 154 >= window.innerHeight - windowInsets().bottom) appMenu.classList.add("intro-bottom")

            el.appMenu = appMenu
            parent.GrooveBoard.backendMethods.navigation.push("tweaksContextMenuOn", () => { }, () => {
                contextMenuClose()
            })
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK")
            }, 300);
            window.appMenuCreationSecondTimeout = setTimeout(() => {
                $("div.innerApp").addClass("app-menu-back").removeClass("app-menu-back-intro")
                e.target.appMenuState = true
                scrollers.styles.cancelScroll()
                setTimeout(() => {
                    Groove.triggerHapticFeedback("CONFIRM")
                }, 50);
            }, 375);

        }, 500);
    })
}
refreshList()
function onItemClick(el) {
    const item = el.target
    if (item.classList.contains("expanded")) {
        item.classList.remove("expanded")
        item.querySelector(".expanded-panel")?.remove()
        setTimeout(() => {
            Groove.triggerHapticFeedback("CONFIRM")
        }, 250);
    } else {
        document.querySelectorAll(".groove-list-view-item.expanded").forEach(expandedItem => {
            expandedItem.classList.remove("expanded")
            expandedItem.querySelector(".expanded-panel")?.remove()
        })

        item.classList.add("expanded")
        item.innerHTML += `
                <div class="expanded-panel" style="padding-bottom: 16px; pointer-events: none;">
                    <button class="metro-button spinner" style="margin-left: auto;pointer-events: auto;">
                        Remove
                    </button>
                </div>
            `
        item.querySelector(".metro-button").addEventListener("flowClick", async (e) => {
            styleManagerInstance.removeStyle(item.style_id)
            item.remove()
            refreshList(true)
            window.parent.GrooveBoard.backendMethods.refreshStyles()
        })

        setTimeout(() => {
            Groove.triggerHapticFeedback("CONFIRM")
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK")
            }, 125);
        }, 250);
    }
}
function addManually() {
    var alertView;
    alertView = window.parent.GrooveBoard.alert(
        "Enter the style url",
        "<input type='url' placeholder='style url' class='metro-text-input enter-style-url' style='width:100%;'>",
        [{
            title: "add", style: "default", inline: true, action: () => {
                const url = alertView.querySelector("input.enter-style-url").value
                if (url.endsWith(".css")) {
                    fetch(url)
                        .then(response => response.text().then(cssText => ({ cssText, response })))
                        .then(({ cssText, response }) => {
                            //check if response code is successful
                            if (!response.ok) {
                                //show a different error about network problem
                                parent.GrooveBoard.alert("Error", "An error occurred while loading the CSS file. Please check the URL and try again.", [{ title: "OK", style: "default", action: () => { } }])
                                return;
                            }

                            // Regular expressions to extract metadata
                            const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
                            const authorMatch = cssText.match(/\/\* author: (.*?) \*\//);
                            const iconMatch = cssText.match(/\/\* icon: (.*?) \*\//);
                            const descriptionMatch = cssText.match(/\/\* description: (.*?) \*\//);

                            let metadata = {
                                title: titleMatch ? titleMatch[1] : 'No title',
                                author: authorMatch ? authorMatch[1] : 'No author',
                                icon: iconMatch ? iconMatch[1] : 'No icon',
                                description: descriptionMatch ? descriptionMatch[1] : 'No description',
                            };
                            const flyout = document.createElement("div")
                            flyout.classList.add("install-flyout")
                            const author = metadata.author.match(/\[(.*?)\]\((.*?)\)/);
                            const authorHTML = author ? author[1] : metadata.author;

                            flyout.innerHTML = `
                            <div class="install-flyout-inner">
                            <img class="install-flyout-icon" src="${metadata.icon}">
                            <p class="install-flyout-title">${metadata.title}</p>
                            <p class="install-flyout-author">${authorHTML}</p>
                            <p class="install-flyout-description">${metadata.description}</p>
                            <button class="install-flyout-install">Install</button>
                            </div>
                            `
                            if (author) {
                                flyout.querySelector("p.install-flyout-author").addEventListener("click", () => {
                                    parent.GrooveBoard.alert("External Link Warning", "This link opens up an external website. Proceed with caution.", [{
                                        title: "Proceed", style: "default", action: () => {
                                            Groove.openURL(author[2])
                                        }
                                    }, { title: "Cancel", style: "default", action: () => { } }])
                                })
                            }
                            window.parent.GrooveBoard.backendMethods.navigation.push("appMenuOpened", () => { }, () => {
                                flyout.classList.add("hidden")
                                setTimeout(() => {
                                    flyout.remove()
                                }, 500);
                            })
                            flyout.querySelector("button.install-flyout-install").addEventListener("click", async (e) => {
                                e.target.innerText = "Installing..."
                                try {
                                    styleManagerInstance.installStyle(cssText)
                                    flyout.remove()
                                    parent.GrooveBoard.alert("Style Installed", "The style has been installed successfully.", [{
                                        title: "OK", style: "default", action: () => {
                                            refreshList(); window.parent.GrooveBoard.backendMethods.refreshStyles()
                                        }
                                    }])
                                    refreshList()
                                    window.parent.GrooveBoard.backendMethods.refreshStyles()
                                } catch (error) {
                                    parent.GrooveBoard.alert("Error", "An error occurred while installing the style. Please try again later.", [{ title: "OK", style: "default", action: () => { } }])

                                }

                            })
                            document.body.appendChild(flyout)
                            console.log("metadata", metadata)
                        })
                        .catch(error => {
                            console.error('Error loading CSS:', error)
                            parent.GrooveBoard.alert("Error", "An error occurred while loading the CSS file. Please check the URL and try again.", [{ title: "OK", style: "default", action: () => { } }])
                        });
                } else {
                    parent.GrooveBoard.alert("Error", "The URL you entered is not a valid CSS file.", [{ title: "OK", style: "default", action: () => { } }])
                }

            }
        },
        {
            title: "cancel", style: "default", inline: true, action: () => { }
        }]
    );
    setTimeout(() => {
        alertView.querySelector("input.enter-style-url").focus()
    }, 250);
    console.log("alertView", alertView)

}
function writeManually() {
    // Create a flyout for manual CSS entry with fullscreen textarea and Apply/Cancel buttons
    const flyout = document.createElement("div");
    flyout.classList.add("install-flyout", "manual-write-flyout");
    flyout.innerHTML = `
        <div class="install-flyout-inner" style="height: 100vh; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex:1; display:flex; flex-direction:column;">
                <p class="install-flyout-title" style="font-size: 1.3em; margin-bottom: 12px;">Write or Paste CSS</p>
                <textarea class="manual-css-input" style="flex:1; width:100%; min-height:300px; resize:vertical; font-family:monospace; font-size:1em; border-radius:8px; border:1px solid #ccc; padding:12px;" placeholder="Paste your CSS here..."></textarea>
            </div>
            <div style="display:flex; gap:12px; margin-top:24px;">
                <button class="install-flyout-cancel metro-button" style="flex:1;">Cancel</button>
                <button class="install-flyout-install metro-button" style="flex:1;">Apply</button>
            </div>
        </div>
    `;
    document.body.appendChild(flyout);

    // Focus textarea
    setTimeout(() => {
        flyout.querySelector("textarea.manual-css-input").focus();
    }, 200);

    // Helper to close flyout
    function closeFlyout() {
        flyout.classList.add("hidden");
        setTimeout(() => flyout.remove(), 400);
        window.parent.GrooveBoard.backendMethods.navigation.invalidate("manualWriteFlyout");
        window.removeEventListener("popstate", onBack);
    }

    // Cancel button
    flyout.querySelector(".install-flyout-cancel").addEventListener("click", () => {
        const cssText = flyout.querySelector("textarea.manual-css-input").value.trim();
        if (cssText) {
            parent.GrooveBoard.alert(
                "Discard Edits?",
                "You have unsaved changes. Discard them?",
                [
                    {
                        title: "Discard", style: "destructive", action: () => closeFlyout()
                    },
                    { title: "Cancel", style: "default", action: () => {
                        // Add back to GrooveBoard navigation history
                        if (window.parent.GrooveBoard?.backendMethods?.navigation?.push) {
                            window.parent.GrooveBoard.backendMethods.navigation.push(
                                "manualWriteFlyout",
                                () => {},
                                () => { onBack(); }
                            );
                        }
                    } }
                ]
            );
        } else {
            closeFlyout();
        }
    });

    // Apply button
    flyout.querySelector(".install-flyout-install").addEventListener("click", async (e) => {
        const cssText = flyout.querySelector("textarea.manual-css-input").value.trim();
        if (!cssText) {
            parent.GrooveBoard.alert("Error", "Please enter some CSS.", [{ title: "OK", style: "default", action: () => { } }]);
            return;
        }
        e.target.innerText = "Installing...";
        try {
            styleManagerInstance.installStyle(cssText);
            closeFlyout();
            parent.GrooveBoard.alert("Style Installed", "The style has been installed successfully.", [{
                title: "OK", style: "default", action: () => {
                    refreshList();
                    window.parent.GrooveBoard.backendMethods.refreshStyles();
                }
            }]);
            refreshList();
            window.parent.GrooveBoard.backendMethods.refreshStyles();
        } catch (error) {
            parent.GrooveBoard.alert("Error", "An error occurred while installing the style. Please try again later.", [{ title: "OK", style: "default", action: () => { } }]);
        }
    });

    // Back button support
    function onBack() {
        const cssText = flyout.querySelector("textarea.manual-css-input").value.trim();
        if (cssText) {
            parent.GrooveBoard.alert(
                "Discard Edits?",
                "You have unsaved changes. Discard them?",
                [
                    {
                        title: "Discard", style: "destructive", action: () => {
                            closeFlyout();
                            history.back();
                        }
                    },
                    { title: "Cancel", style: "default", action: () => {
                        // push state again to keep flyout open and add back to GrooveBoard navigation history
                        history.pushState({}, "");
                        if (window.parent.GrooveBoard?.backendMethods?.navigation?.push) {
                            window.parent.GrooveBoard.backendMethods.navigation.push(
                                "manualWriteFlyout",
                                () => {},
                                () => { onBack(); }
                            );
                        }
                    } }
                ]
            );
        } else {
            closeFlyout();
            history.back();
        }
    }

    // Register with GrooveBoard navigation stack if available
    if (window.parent.GrooveBoard?.backendMethods?.navigation?.push) {
        window.parent.GrooveBoard.backendMethods.navigation.push(
            "manualWriteFlyout",
            () => {},
            () => {
                onBack();
            }
        );
    }
}
function addFile(){
    // Open a file selector for .css files
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.css,text/css';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            input.remove();
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const cssText = e.target.result;
            // Try to extract metadata
            const titleMatch = cssText.match(/\/\* title: (.*?) \*\//);
            const authorMatch = cssText.match(/\/\* author: (.*?) \*\//);
            const iconMatch = cssText.match(/\/\* icon: (.*?) \*\//);
            const descriptionMatch = cssText.match(/\/\* description: (.*?) \*\//);

            let metadata = {
                title: titleMatch ? titleMatch[1] : 'No title',
                author: authorMatch ? authorMatch[1] : 'No author',
                icon: iconMatch ? iconMatch[1] : 'No icon',
                description: descriptionMatch ? descriptionMatch[1] : 'No description',
            };
            const flyout = document.createElement("div");
            flyout.classList.add("install-flyout");
            const author = metadata.author.match(/\[(.*?)\]\((.*?)\)/);
            const authorHTML = author ? author[1] : metadata.author;

            flyout.innerHTML = `
                <div class="install-flyout-inner">
                <img class="install-flyout-icon" src="${metadata.icon}">
                <p class="install-flyout-title">${metadata.title}</p>
                <p class="install-flyout-author">${authorHTML}</p>
                <p class="install-flyout-description">${metadata.description}</p>
                <button class="install-flyout-install">Install</button>
                </div>
            `;
            if (author) {
                flyout.querySelector("p.install-flyout-author").addEventListener("click", () => {
                    parent.GrooveBoard.alert("External Link Warning", "This link opens up an external website. Proceed with caution.", [{
                        title: "Proceed", style: "default", action: () => {
                            Groove.openURL(author[2])
                        }
                    }, { title: "Cancel", style: "default", action: () => { } }])
                })
            }
            window.parent.GrooveBoard.backendMethods.navigation.push("appMenuOpened", () => { }, () => {
                flyout.classList.add("hidden")
                setTimeout(() => {
                    flyout.remove()
                }, 500);
            })
            flyout.querySelector("button.install-flyout-install").addEventListener("click", async (e) => {
                e.target.innerText = "Installing..."
                try {
                    styleManagerInstance.installStyle(cssText)
                    flyout.remove()
                    parent.GrooveBoard.alert("Style Installed", "The style has been installed successfully.", [{
                        title: "OK", style: "default", action: () => {
                            refreshList();
                            window.parent.GrooveBoard.backendMethods.refreshStyles();
                        }
                    }])
                    refreshList()
                    window.parent.GrooveBoard.backendMethods.refreshStyles()
                } catch (error) {
                    parent.GrooveBoard.alert("Error", "An error occurred while installing the style. Please try again later.", [{ title: "OK", style: "default", action: () => { } }])
                }
            });
            document.body.appendChild(flyout);
            input.remove();
        };
        reader.readAsText(file);
    });

    input.click();
}
const iconPackPicker = document.getElementById("icon-pack-picker")

function addIconPack() {
    iconPackPicker.querySelector("div.groove-list-view div").innerHTML = ""
    const iconPacks = JSON.parse(Groove.getIconPacks())
    iconPacks.forEach((iconPack, index) => {
        const iconPackInfo = window.parent.GrooveBoard.backendMethods.getAppDetails(iconPack, true);
        const iconPackItem = GrooveElements.wListViewItem(iconPackInfo.label, "")
        const iconPackImage = document.createElement("img")
        iconPackImage.src = JSON.parse(window.parent.Groove.getAppIconURL(iconPack)).foreground
        iconPackImage.style.cssText = `
        background-image: url(${JSON.parse(window.parent.Groove.getAppIconURL(iconPack)).background});
        background-size: cover;
        background-position: center;
        `
        iconPackItem.prepend(iconPackImage)
        iconPackPicker.querySelector("div.groove-list-view div").appendChild(iconPackItem)
    })


    clearTimeout(window.iconPackPickerTimeout)
    iconPackPicker.classList.add("shown-animation", "shown")
    window.parent.GrooveBoard.backendMethods.navigation.push("settings-inner-page:accent-color-picker", () => { }, () => {
        clearTimeout(window.iconPackPickerTimeout)
        iconPackPicker.classList.remove("shown")
        iconPackPicker.classList.add("hidden")
        window.iconPackPickerTimeout = setTimeout(() => {
            iconPackPicker.classList.remove("shown-animation", "hidden")

        }, 500 * animationDurationScale);
        Array.from({ length: 6 }, (_, i) => {
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK");
            }, (i * 20 + 60) * window.parent.GrooveBoard.backendMethods.animationDurationScale.get());
        });
    })
    Array.from({ length: 6 }, (_, i) => {
        setTimeout(() => {
            Groove.triggerHapticFeedback("CLOCK_TICK");
        }, i * 20 * window.parent.GrooveBoard.backendMethods.animationDurationScale.get());
    });

}
const appBar = GrooveElements.wAppBar([
    {
        title: "Add", icon: "󰐕", size: "38px", action: addManually
    },
    {
        title: "Add File", icon: "󰁦", size: "38px", action: addFile
    },
    {
        title: "Edit", icon: "󰲶", action: writeManually
    }
])
const appBar2 = GrooveElements.wAppBar([
    {
        title: "Add", icon: "󰐕", size: "38px", action: addIconPack
    }
])
document.body.append(appBar)
document.body.append(appBar2)
window.appBar = appBar
window.appBar2 = appBar2

// Global tile preferences functionality
function initializeGlobalTilePreferences() {
    setupGlobalIconDropdown();
    setupGlobalBackgroundDropdown();
    setupGlobalTextColorDropdown();
}

function checkMonochromeIconsSupport() {
    try {
        // Check both API level and explicit support method
        if (window.Groove && window.Groove.supportsMonochromeIcons) {
            return window.Groove.supportsMonochromeIcons() === "true";
        } else if (window.Groove && window.Groove.getAPILevel) {
            const apiLevel = parseInt(window.Groove.getAPILevel());
            return apiLevel >= 33; // Android 13 (TIRAMISU) and above
        } else {
            // Fallback for web mode - don't assume support
            return false;
        }
    } catch (error) {
        console.log("Error checking monochrome icons support:", error);
        return false;
    }
}

function setupGlobalIconDropdown() {
    const iconDropdown = document.getElementById("global-icon-dropdown");
    
    // Clear existing options except the first "Default" option
    const defaultOption = iconDropdown.querySelector("div.metro-dropdown-option[value='default']");
    iconDropdown.innerHTML = "";
    iconDropdown.appendChild(defaultOption);
    
    // Add monochrome option if supported
    if (checkMonochromeIconsSupport()) {
        const monochromeOption = document.createElement("div");
        monochromeOption.classList.add("metro-dropdown-option");
        monochromeOption.setAttribute("value", "monochrome");
        monochromeOption.setAttribute("data-i18n", "settings.apps.icon_selections.monochrome");
        monochromeOption.innerText = "Monochrome";
        iconDropdown.appendChild(monochromeOption);
    }
    
    // Add icon pack options
    try {
        const iconPacks = JSON.parse(Groove.getIconPacks());
        iconPacks.forEach(iconPack => {
            const iconPackInfo = window.parent.GrooveBoard.backendMethods.getAppDetails(iconPack, true);
            const option = document.createElement("div");
            option.classList.add("metro-dropdown-option");
            option.setAttribute("value", iconPack);
            option.innerText = iconPackInfo.label;
            iconDropdown.appendChild(option);
        });
    } catch (error) {
        console.log("Error loading icon packs:", error);
    }
    
    // Load saved preference
    const savedIconPref = getGlobalTilePreference("icon");
    const options = iconDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === savedIconPref) {
            selectedIndex = index;
        }
    });
    iconDropdown.setAttribute("selected", selectedIndex);
    iconDropdown.selectOption(selectedIndex);
    
    // Handle dropdown changes
    iconDropdown.addEventListener('selected', (e) => {
        const selectedOption = options[e.detail.index];
        const value = selectedOption.getAttribute("value");
        
        setGlobalTilePreference("icon", value);
        
        // Apply legacy behavior for icon packs
        if (value !== "default" && value !== "monochrome") {
            localStorage.setItem("iconPack", value);
            Groove.applyIconPack(value);
            window.parent.GrooveBoard.alert(
                "Notice",
                "You need to restart the app to apply the icon pack.",
                [{
                    title: "Ok", style: "default", action: () => {
                        window.parent.location.reload()
                    }
                },
                { title: "Later", style: "default", action: () => { } }
                ]
            );
        } else if (value === "default") {
            localStorage.setItem("iconPack", "");
            Groove.applyIconPack("");
        }
        
        // Apply monochrome setting
        if (value === "monochrome") {
            localStorage.setItem("monochromeIcons", "enable");
            if (window.Groove && window.Groove.setMonochromeIcons) {
                window.Groove.setMonochromeIcons(true);
            }
        } else {
            localStorage.setItem("monochromeIcons", "default");
            if (window.Groove && window.Groove.setMonochromeIcons) {
                window.Groove.setMonochromeIcons(false);
            }
        }
    });
}

function setupGlobalBackgroundDropdown() {
    const backgroundDropdown = document.getElementById("global-background-dropdown");
    
    // Load saved preference
    const savedBackgroundPref = getGlobalTilePreference("background");
    const options = backgroundDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === savedBackgroundPref) {
            selectedIndex = index;
        }
    });
    backgroundDropdown.setAttribute("selected", selectedIndex);
    backgroundDropdown.selectOption(selectedIndex);
    
    // Handle dropdown changes
    backgroundDropdown.addEventListener('selected', (e) => {
        const selectedOption = options[e.detail.index];
        const value = selectedOption.getAttribute("value");
        console.log("Global background preference changed to:", value);
        setGlobalTilePreference("background", value);
    });
}

function setupGlobalTextColorDropdown() {
    const textColorDropdown = document.getElementById("global-text-color-dropdown");
    
    // Load saved preference
    const savedTextColorPref = getGlobalTilePreference("textColor");
    const options = textColorDropdown.querySelectorAll("div.metro-dropdown-option");
    let selectedIndex = 0;
    options.forEach((option, index) => {
        if (option.getAttribute("value") === savedTextColorPref) {
            selectedIndex = index;
        }
    });
    textColorDropdown.setAttribute("selected", selectedIndex);
    textColorDropdown.selectOption(selectedIndex);
    
    // Handle dropdown changes
    textColorDropdown.addEventListener('selected', (e) => {
        const selectedOption = options[e.detail.index];
        const value = selectedOption.getAttribute("value");
        console.log("Global text color preference changed to:", value);
        setGlobalTilePreference("textColor", value);
    });
}

function getGlobalTilePreference(key) {
    if (!localStorage["globalTilePreferences"]) {
        localStorage["globalTilePreferences"] = JSON.stringify({
            icon: "default",
            background: "default",
            textColor: "default"
        });
    }
    const prefs = JSON.parse(localStorage["globalTilePreferences"]);
    return prefs[key] || "default";
}

function setGlobalTilePreference(key, value) {
    if (!localStorage["globalTilePreferences"]) {
        localStorage["globalTilePreferences"] = JSON.stringify({
            icon: "default",
            background: "default", 
            textColor: "default"
        });
    }
    const prefs = JSON.parse(localStorage["globalTilePreferences"]);
    prefs[key] = value;
    localStorage["globalTilePreferences"] = JSON.stringify(prefs);
    console.log("Saved global tile preference:", key, "=", value);
    
    // Trigger tile refresh when global preferences change
    if (window.parent) {
        window.parent.dispatchEvent(new CustomEvent('tilePreferencesChanged', { 
            detail: { global: true, key, value } 
        }));
        console.log("Dispatched tilePreferencesChanged event for global preference change");
    }
}

// Initialize global tile preferences
initializeGlobalTilePreferences();