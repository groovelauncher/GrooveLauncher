import jQuery from "jquery";
var $ = jQuery

const appListPage = $("div.inner-page.app-list-page")
const appListSearch = $("input.app-list-search")
const letterSelector = $("div.letter-selector")
const stickyLetterTile = $("#sticky-letter")

$("div.groove-element.groove-app-tile.groove-letter-tile")
const searchModeSwitch = {
    on: () => {
        GrooveBoard.backendMethods.navigation.push("searchOn", () => { }, searchModeSwitch.off)
        appListSearch.focus()

        setTimeout(() => {
            scrollers.main_home_scroller.enabled = false
        }, 0);
        appListSearch.val("")
        appListSearch.removeAttr("disabled")
        clearTimeout(appListPage[0].searchModeOffTimeout)
        appListPage.addClass("search-mode-animations").addClass("search-mode")
        setTimeout(() => {
            scrollers.main_home_scroller.enabled = false

            appListSearch.focus()
        }, 250);
        scrollers.app_page_scroller.refresh()
        setTimeout(() => { scrollers.app_page_scroller.refresh() }, 500);
        // history.pushState("searchmodeon", document.title, location.href);
        appListPage.removeClass("no-search-result")
        $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").removeClass("search-hidden")
        scrollers.app_page_scroller.scrollTo(0, 0, 0, "linear")
        $("div.app-search-search-store").css("visibility", "hidden")
    },
    off: () => {
        GrooveBoard.backendMethods.navigation.invalidate("searchOn")
        scrollers.main_home_scroller.enabled = true

        appListPage.removeClass("search-mode")
        appListPage[0].searchModeOffTimeout = setTimeout(() => {
            appListPage.removeClass("search-mode-animations")
            appListSearch.attr("disabled", "true")
        }, 250);
        scrollers.app_page_scroller.refresh()
        setTimeout(() => { scrollers.app_page_scroller.refresh(); appListSearch.val("") }, 500);

        $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").each(function (index, element) {
            try {
                element.querySelector("p.groove-app-tile-title").innerText = element.getAttribute("title")
            } catch (error) {

            }
        })

        appListPage.removeClass("no-search-result")
        $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").removeClass("search-hidden")
    }
}
const letterSelectorSwitch = {
    on: () => {
        GrooveBoard.backendMethods.navigation.push("letterSelectOn", () => { }, letterSelectorSwitch.off)
        scrollers.main_home_scroller.enabled = false
        window.stopInsetUpdate = true
        const enabledones = Object.keys(window.appSortCategories).map(e => e == "0-9" ? "#" : e == "&" ? "" : e)
        $("div.letter-selector-letter").removeClass("disabled")

        $("div.letter-selector-letter").each((index, element) => {
            if (!enabledones.includes(element.innerText.toLocaleUpperCase("en"))) element.classList.add("disabled")
        })
        Groove.setStatusBarAppearance("hide")
        letterSelector.addClass("shown").addClass("shown-animation")
        setTimeout(() => {
            if (letterSelector.hasClass("shown")) letterSelector.removeClass("shown-animation")
        }, 500);
        $("div.letter-selector-row").each((index, element) => {
            $(element).css("--index", index)
        })
    },
    off: () => {
        GrooveBoard.backendMethods.navigation.invalidate("letterSelectOn")
        scrollers.main_home_scroller.enabled = true
        Groove.setStatusBarAppearance("light")
        letterSelector.removeClass("shown").addClass("shown-animation").addClass("hidden")
        setTimeout(() => {
            delete window.stopInsetUpdate

            if (letterSelector.hasClass("hidden")) letterSelector.removeClass("shown-animation").removeClass("hidden")

        }, 500);
    }
}

appListSearch.on("focus", function () {
    GrooveBoard.backendMethods.navigation.push("searchBarFocus", () => { }, () => {
        appListSearch.blur()
    })

})
appListSearch.on("blur", function () {
    GrooveBoard.backendMethods.navigation.invalidate("searchBarFocus")

})
$("#search-icon").on("flowClick", function () {
    const searchModeOn = appListPage.hasClass("search-mode")
    if (searchModeOn) {
        searchModeSwitch.off()
    } else {
        searchModeSwitch.on()
    }

})
$(window).on("finishedLoading", () => {
    window.scrollers.main_home_scroller.on("scrollStart", () => {
        scrollers.tile_page_scroller.refresh()
        scrollers.app_page_scroller.refresh()
    })

    $("div.letter-selector-letter").on("flowClick", function (e) {
        if (e.target.classList.contains("disabled")) return
        letterSelectorSwitch.off()
        scrollers.app_page_scroller.scrollTo(0, Math.max(scrollers.app_page_scroller.maxScrollY, window.windowInsets().top - document.querySelector(`div.groove-app-tile.groove-letter-tile[icon='${e.target.innerText}']`).offsetTop,), 0, "linear")
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
    })
})
appListSearch.on("input", function (e) {
    const search = window.normalizeDiacritics(this.value).toLocaleLowerCase("en")
    if (search.length == 0) $("div.app-search-search-store").css("visibility", "hidden"); else $("div.app-search-search-store").css("visibility", "");
    $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").each(function (index, element) {
        try {
            const app_title = window.normalizeDiacritics(element.title).toLocaleLowerCase("en")
            if (app_title.includes(search)) {
                $(element).removeClass("search-hidden")
                const ogtitle = element.getAttribute("title")
                const indexoftitle = app_title.indexOf(search)
                element.querySelector("p.groove-app-tile-title").innerHTML = `${ogtitle.slice(0, indexoftitle)}<span class="groove-app-tile-title-search-tip">${ogtitle.slice(indexoftitle, indexoftitle + search.length)}</span>${ogtitle.slice(indexoftitle + search.length)}`

            } else {
                $(element).addClass("search-hidden")
            }
        } catch (error) {

        }
    })
    if ($("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile):not(.search-hidden)").length == 0) {
        appListPage.addClass("no-search-result")
        $("div.app-search-no-result > span").text(this.value)

    } else {
        appListPage.removeClass("no-search-result")
    }
    scrollers.app_page_scroller.refresh()

})
$("div.app-search-search-store").on("flowClick", () => {
    //window.open("https://play.google.com/store/search?q=" + appListSearch[0].value, "_blank")
    Groove.searchStore(appListSearch[0].value)
})




$(window).on("click", function (e) {
    if (e.target.classList.contains("groove-letter-tile")) {
        setTimeout(letterSelectorSwitch.on, 0);
    } else if (e.target.classList.contains("groove-app-tile") && !e.target.classList.contains("groove-letter-tile")) {
        if (e.target.canClick) {
            e.target.classList.add("app-transition-selected")
            appTransition.onPause()
            setTimeout(() => {
                Groove.launchApp(e.target.getAttribute("packageName"))
            }, 1000);
        }
    }
})
$("div.app-list-page").on("flowClick", function (e) {
    if (e.target.classList.contains("app-menu-back") || e.target.classList.contains("app-menu-back-intro")) {
        appMenuClose()
    }
})

$(window).on("pointerdown", function (e) {
    if (e.target.classList.contains("groove-app-tile") && !e.target.classList.contains("groove-letter-tile")) {
        e.target.canClick = true
        e.target.appMenu = false
        e.target.appMenuState = false
        e.target.appRect = e.target.getBoundingClientRect()
        clearTimeout(window.appMenuCreationFirstTimeout)
        clearTimeout(window.appMenuCreationSecondTimeout)
        $("div.groove-app-menu").remove()
        window.appMenuCreationFirstTimeout = setTimeout(() => {
            e.target.canClick = false
            scrollers.main_home_scroller.enabled = false
            $("div.app-list-page").addClass("app-menu-back-intro")
            const appMenu = GrooveBoard.boardMethods.createAppMenu(e.target.getAttribute("packagename"))
            const optionalTop = (e.target.offsetTop + scrollers.app_page_scroller.y + 64)
            appMenu.style.top = (optionalTop + 154 >= window.innerHeight ? optionalTop - 64 : optionalTop) + "px"
            appMenu.style.setProperty("--pointerX", e.pageX - $("div.app-list-page").position().left + "px")
            appMenu.classList.add("intro")
            const appClone = e.target.cloneNode(true)
            appClone.setAttribute("style", appClone.getAttribute("style") + "transition-duration: 1s !important;")
            $(appClone).addClass("app-tile-clone").css({
                left: e.target.appRect.left - $("div.app-list-page").position().left,
                top: e.target.appRect.top
            })
            $("div.app-list-page").append(appClone)
            setTimeout(() => {
                appClone.classList.remove("active")
            }, 0);
            e.target.style.visibility = "hidden"

            if (optionalTop + 154 >= window.innerHeight) appMenu.classList.add("intro-bottom")

            e.target.appMenu = appMenu
            GrooveBoard.backendMethods.navigation.push("appMenuOn", () => { }, () => {
                appMenuClose()
            })

            window.appMenuCreationSecondTimeout = setTimeout(() => {
                $("div.app-list-page").addClass("app-menu-back").removeClass("app-menu-back-intro")
                e.target.appMenuState = true
                cancelScroll(scrollers.app_page_scroller)

            }, 500);

        }, 500);
    }
})

$(window).on("pointerup", function (e) {
    $("div.groove-app-tile").each((index, element) => {
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
function appMenuClose() {
    GrooveBoard.backendMethods.navigation.invalidate("appMenuOn")
    clearTimeout(window.appMenuCreationFirstTimeout)
    clearTimeout(window.appMenuCreationSecondTimeout)
    $("div.groove-app-menu").remove()
    $("div.app-list-page").removeClass("app-menu-back app-menu-back-intro")
    setTimeout(() => {
        appMenuClean()
    }, 500);
    scrollers.main_home_scroller.enabled = true

}
function appMenuClean() {
    GrooveBoard.backendMethods.navigation.invalidate("appMenuOn")

    clearTimeout(window.appMenuCreationFirstTimeout)
    clearTimeout(window.appMenuCreationSecondTimeout)
    $("div.app-list-page").removeClass("app-menu-back-intro")
    $("div.groove-app-tile").css("visibility", "")
    $("div.app-tile-clone").remove()
}
function appImmediateClose() {
    $("div.groove-app-tile").each((index, element) => {
        if (element["appMenuState"] == false) {
            if (element["appMenu"]) element["appMenu"].remove()
            delete element["appMenuState"]
            delete element["appMenu"]
            delete element["appRect"]
            appMenuClean()

        } else if (element["appMenuState"] == true) {

        }

    })
}
window.appMenuClean = appMenuClean
window.appMenuClose = appMenuClose
$(window).on("finishedLoading", () => {
    scrollers.app_page_scroller.scroller.hooks.on('scrollStart', appImmediateClose)
    scrollers.main_home_scroller.scroller.hooks.on('scrollStart', appImmediateClose)
    stickyLetter()
})
window.stickyLetter = stickyLetter
var lastScroll = 0

function getTranslateY(element) {
    // Get the computed style of the element
    const transform = $(element).css('transform');

    // Check if the transform property is not 'none'
    if (transform !== 'none') {
        // Extract the translateY value from the matrix
        const matrix = transform.match(/^matrix\(([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+\)$/);

        if (matrix) {
            // The translateY value is the sixth number in the matrix
            return parseFloat(matrix[6]);
        }
    }

    // Return 0 if there is no transform or translateY is not found
    return 0;
}
function stickyLetter() {
    const lastChange = GrooveBoard.backendMethods.navigation.history.slice(-1)[0].change
    if (lastChange != "appMenuOpened") {
        requestAnimationFrame(stickyLetter)
        return

    }
    var scroll
    try {
        scroll = - $("div.app-list-container").offset().top
    } catch (error) {
        scroll = 0
    }

    if (scroll != lastScroll) {

        $("div.app-list-container > div.groove-element.groove-app-tile.groove-letter-tile").css("transition", " all 0s")
        const topinset = windowInsets().top
        const allLetterTiles = $("div.app-list-container > div.groove-element.groove-app-tile.groove-letter-tile")
        allLetterTiles.each((index, element) => {
            const elementScrollTop = element.offsetTop - topinset - scroll
            const zone = elementScrollTop < -64 ? -1 : elementScrollTop < 0 ? 0 : elementScrollTop < 64 ? 1 : 2

            if (zone == 0) {

                stickyLetterTile.css({
                    transition: " transform 0s",
                    transform: `translateY(0px)`
                }).attr("icon", element.getAttribute("icon")).children("p.groove-app-tile-icon").text(element.getAttribute("icon"))
            } else if (zone == 1) {
                stickyLetterTile.css({
                    transition: "transform 0s",
                    transform: `translateY(${elementScrollTop - 64}px)`
                })
                if(allLetterTiles[index - 1]){
                    stickyLetterTile.attr("icon", allLetterTiles[index - 1].getAttribute("icon")).children("p.groove-app-tile-icon").text(allLetterTiles[index - 1].getAttribute("icon"))
                
                }
            } else {

            }
            if (scroll > 21) {
                stickyLetterTile.css({
                    opacity: 1
                })
            } else {
                stickyLetterTile.css({
                    opacity: 0
                })
            }

            return;
            //const topinset = windowInsets.top
            //const minTop = element.offsetTop - topinset
            const next = $(element).nextAll(".groove-letter-tile")
            const maxTop = next.length ? (next[0].offsetTop - (64 + 0) - topinset) : 99999
            if (scroll < minTop) {
                element.style.setProperty("--flow-before-translate", `0px, 0px`)
                element.style.setProperty("z-index", "")
                element.classList.remove("opaque")
            } else {
                element.style.setProperty("--flow-before-translate", `0px, ${(Math.min(scroll - minTop, maxTop - minTop))}px`)
                element.style.setProperty("z-index", "10")
                element.classList.add("opaque")
            }

        })
    } else {
        $("div.app-list-container > div.groove-element.groove-app-tile.groove-letter-tile").css("transition", "")
    }
    lastScroll = scroll

    requestAnimationFrame(stickyLetter)
}


