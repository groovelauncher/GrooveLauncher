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
    return
    document.querySelectorAll("div.innerApp > div.app-tabs > p").forEach(e => e.classList.remove("active-tab"))
    document.querySelectorAll("div.innerApp > div.app-tabs > p")[index].classList.add("active-tab")
    document.querySelectorAll("div.settings-pages-container > div.settings-page").forEach(e => e.classList.remove("active-page"))
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].style.setProperty("--page-swipe-translate", (next ? scroll : -scroll) + "px")
    document.querySelectorAll("div.settings-pages-container > div.settings-page")[index + 1].style.setProperty("--page-swipe-direction", (next ? 1 : -1))
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
            const tabswidth = maxscroll
            allTabs.forEach((e, index) => {
                var extra = 0
                if (scroll >= (index + 1)) { extra = maxscroll }
                e.style.transform = `translateX(${-transform + extra}px)`
                const innerText = e.innerText
                if (`"${innerText}"` != e.style.getPropertyValue("--ats-title")) e.style.setProperty("--ats-title", `"${innerText}"`)
                const innerTextLeft = tabswidth - e.offsetWidth
                if (`${innerTextLeft}px` != e.style.getPropertyValue("--ats-title-left")) e.style.setProperty("--ats-title-left", `${innerTextLeft}px`)

                //   if (x <= 0) allPages[index].style.transform = scroll >= (index + 1) ? `translateX(${bs.content.offsetWidth - bs.wrapper.offsetWidth * 2}px)` : ""
            })
            //  if (x > 0) { allPages.slice(-1)[0].style.transform = `translateX(${-100 * allPages.length}%)` }
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
        appBar.setState(1)
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
$("#home-tab > div > div.groove-list-view > div.groove-list-view-item").on("flowClick", e => {
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
scrollers.home.scroller.hooks.on('scrollStart', appImmediateClose)

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
    const listView = document.querySelector("#home-tab > div.groove-list-view")
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
        ell.remove()
        refreshList(true)
        window.parent.GrooveBoard.backendMethods.refreshStyles()
    }

    /*entries[window.i18n.t("common.app_menu.pin_to_home")] = () => {
        const findTile = $(
            `div.inner-page.app-list-page > div.app-list > div.app-list-container > div.groove-element.groove-app-tile[packagename="${packageName}"]`
        )[0];
        const iconpack = findTile.classList.contains("iconpack0")
            ? 0
            : findTile.classList.contains("iconpack1")
                ? 1
                : 2;
        const el = GrooveBoard.boardMethods.createHomeTile(
            [2, 2],
            {
                packageName: findTile.getAttribute("packagename"),
                title: findTile.getAttribute("title"),
                icon: findTile.getAttribute("icon"),
                iconbg: findTile.getAttribute("icon-bg"),
                imageIcon: findTile.getAttribute("imageicon") == "true",
                //  supportedSizes: ["s", "m", "w", "l"]
                supportedSizes: ["s", "m", "w"],
            },
            true
        );

        el.classList.add("iconpack" + iconpack);
        scrollers.tile_page_scroller.refresh();
        setTimeout(() => {
            scrollers.main_home_scroller.scrollTo(0, 0, 750);
            setTimeout(() => {
                scrollers.tile_page_scroller.scrollTo(
                    0,
                    -el.offsetTop - el.offsetHeight / 2 + window.innerHeight / 2,
                    500
                );
            }, 300);
        }, 300);

        backendMethods.homeConfiguration.save()
    }
    entries[window.i18n.t("common.app_menu.uninstall")] = () => {
        if (GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
            Groove.uninstallApp(packageName, 0);
        } else {
            parent.GrooveBoard.alert(
                window.i18n.t("common.alerts.uninstall.title"),
                window.i18n.t("common.alerts.uninstall.message"),
                [{
                    title: window.i18n.t("common.actions.yes"), style: "default", inline: true, action: () => {
                        Groove.uninstallApp(packageName, GrooveBoard.backendMethods.packageManagerProvider.get());
                    }
                }, { title: window.i18n.t("common.actions.no"), style: "default", inline: true, action: () => { } }]
            );
        }
    }*/
    const el = GrooveElements.wContextMenu(ell, entries);
    document.querySelector("body").appendChild(el);
    /*if (document.querySelectorAll(`div.groove-home-tile[packagename="${packageName}"]`).length > 0) {
        el.querySelector("div:nth-child(1)").classList.add("disabled")
    }
    if (allappsarchive.filter(e => e.packageName == packageName)[0].type == 0) {
        el.querySelector("div:nth-child(2)").remove()
        el.style.setProperty("--full-height", "89px")
    }*/
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
            const optionalTop = (e.target.offsetTop + scrollers.home.y + 64 + 83 + 5)
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
                scrollers.home.cancelScroll()
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
const appBar = GrooveElements.wAppBar([
    {
        title: "Add", icon: "󰐕", size: "38px", action: addManually
    }
])
document.body.append(appBar)
window.appBar = appBar