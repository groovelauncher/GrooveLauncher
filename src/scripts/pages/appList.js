import jQuery from "jquery";
import _ from "lodash";
import i18n from "../localeManager";
var $ = jQuery

const appListPage = $("div.inner-page.app-list-page")
const appListContainer = $("div.app-list-container")
const appListSearch = $("input.app-list-search")
const letterSelector = $("div.letter-selector")
const stickyLetterTile = $("#sticky-letter")

var isSearchModeOn = false
$("div.groove-element.groove-app-tile.groove-letter-tile")
function searchResultClick(e) {
    if (!e.target.canClick || e.target.appMenuState) return;

    $("div.groove-app-tile").off("flowClick", searchResultClick)
    e.target.classList.add("app-transition-selected")
    appTransition.onPause()
    const packageName = e.target.getAttribute("packagename")
    setTimeout(() => {
        if (!window.doubleTapOverride) Groove.launchApp(packageName)
        setTimeout(() => {
            searchModeSwitch.off()
        }, 100 * animationDurationScale);
    }, (packageName.startsWith("groove.internal") && false ? 500 : 1000) * animationDurationScale);


}
const searchModeSwitch = {
    on: () => {
        isSearchModeOn = true
        GrooveBoard.backendMethods.navigation.push("searchOn", () => { }, searchModeSwitch.off)
        appListSearch.focus()
        $("div.groove-app-tile").on("flowClick", searchResultClick)

        setTimeout(() => {
            scrollers.main_home_scroller.enabled = false
        }, 0);
        appListSearch.val("")
        appListSearch.removeAttr("disabled")
        clearTimeout(appListPage[0].searchModeOffTimeout)
        appListPage.addClass("search-mode-animations").addClass("search-mode")
        appListContainer.css("transition", "")

        setTimeout(() => {
            scrollers.main_home_scroller.enabled = false
            scrollers.app_page_scroller.refresh()
            appListSearch.focus()
            appListContainer.css("transition", "transform 0s")
        }, 250 * animationDurationScale);
        setTimeout(() => { scrollers.app_page_scroller.refresh() }, 500 * animationDurationScale);
        // history.pushState("searchmodeon", document.title, location.href);
        appListPage.removeClass("no-search-result")
        $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").removeClass("search-hidden")
        scrollers.app_page_scroller.scrollTo(0, 0, 0, "linear")
        $("div.app-search-search-store").css("visibility", "hidden")
    },
    off: () => {
        appListContainer.css("transition", "")
        GrooveBoard.backendMethods.navigation.invalidate("searchOn")
        scrollers.main_home_scroller.enabled = true
        $("div.groove-app-tile").off("flowClick", searchResultClick)

        appListPage.removeClass("search-mode")
        appListPage[0].searchModeOffTimeout = setTimeout(() => {
            appListPage.removeClass("search-mode-animations")
            appListSearch.attr("disabled", "true")
            stickyLetter(scrollers.app_page_scroller.y)
            isSearchModeOn = false
        }, 250 * animationDurationScale);
        scrollers.app_page_scroller.refresh()
        setTimeout(() => { scrollers.app_page_scroller.refresh(); appListSearch.val("") }, 500 * animationDurationScale);

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
        }, 500 * GrooveBoard.backendMethods.animationDurationScale.get());
        $("div.letter-selector-row").each((index, element) => {
            $(element).css("--index", index)
        })
        Array.from({ length: 7 }, (_, i) => {
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK");
            }, i * 20 * GrooveBoard.backendMethods.animationDurationScale.get());
        });
    },
    off: () => {
        GrooveBoard.backendMethods.navigation.invalidate("letterSelectOn")
        scrollers.main_home_scroller.enabled = true
        Groove.setStatusBarAppearance("light")
        letterSelector.removeClass("shown").addClass("shown-animation").addClass("hidden")
        setTimeout(() => {
            delete window.stopInsetUpdate

            if (letterSelector.hasClass("hidden")) letterSelector.removeClass("shown-animation").removeClass("hidden")

        }, 500 * GrooveBoard.backendMethods.animationDurationScale.get());
        Array.from({ length: 7 }, (_, i) => {
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK");
            }, (i * 20 + 60) * GrooveBoard.backendMethods.animationDurationScale.get());
        });
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
    window.scrollers.app_page_scroller.scroller.translater.hooks.on('translate', (point) => {
        stickyLetter(-point.y)
    })
    $("div.letter-selector-letter").on("flowClick", function (e) {
        if (e.target.classList.contains("disabled")) return
        letterSelectorSwitch.off()
        scrollers.app_page_scroller.scrollTo(0, Math.max(scrollers.app_page_scroller.maxScrollY, window.windowInsets().top - document.querySelector(`div.groove-app-tile.groove-letter-tile[icon='${e.target.innerText.toLowerCase()}']`).offsetTop,), 0, "linear")
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
    })
})
appListSearch.on("input", _.debounce(function (e) {
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

}, 150))
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
                if (!isSearchModeOn) if (!window.doubleTapOverride) Groove.launchApp(e.target.getAttribute("packageName"))
            }, 1000 * animationDurationScale);
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
            appMenu.style.top = ((optionalTop + 219 >= window.innerHeight - windowInsets().bottom) ? optionalTop - 64 : optionalTop) + "px"
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

            if (optionalTop + 219 >= window.innerHeight - windowInsets().bottom) appMenu.classList.add("intro-bottom")

            e.target.appMenu = appMenu
            GrooveBoard.backendMethods.navigation.push("appMenuOn", () => { }, () => {
                appMenuClose()
            })
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK")
            }, 300);
            window.appMenuCreationSecondTimeout = setTimeout(() => {
                $("div.app-list-page").addClass("app-menu-back").removeClass("app-menu-back-intro")
                e.target.appMenuState = true
                scrollers.app_page_scroller.cancelScroll()
                setTimeout(() => {
                    Groove.triggerHapticFeedback("CONFIRM")
                }, 50);
            }, 375);

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
        stickyLetter(-scrollers.app_page_scroller.y)
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
    scrollers.main_home_scroller.enable()

}
window.appMenuClean = appMenuClean
window.appMenuClose = appMenuClose
$(window).on("finishedLoading", () => {
    scrollers.app_page_scroller.scroller.hooks.on('scrollStart', appImmediateClose)
    scrollers.main_home_scroller.scroller.hooks.on('scrollStart', appImmediateClose)
    stickyLetter(0)
})


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
function stickyLetter(scroll) {
    if (document.querySelector("div.inner-page.app-list-page").classList.contains("app-menu-back") || document.querySelector("div.inner-page.app-list-page").classList.contains("app-menu-back-intro")) return;
    scroll = Math.max(Math.min(scroll, -window.scrollers.app_page_scroller.maxScrollY), -window.scrollers.app_page_scroller.minScrollY)
    clearTimeout(window.stickyLetterTimeout)
    var stickyEl
    var overthrowingEl
    const wInsets = windowInsets()
    const allLetterTiles = $("div.app-list-container > div.groove-element.groove-app-tile.groove-letter-tile")
    Array.from(allLetterTiles).reverse().forEach((element, index) => {
        const scrollTop = element.offsetTop - scroll - wInsets.top
        if (scrollTop < 0 && !stickyEl) stickyEl = element; else if (0 <= scrollTop && scrollTop < 64 && !overthrowingEl) overthrowingEl = element;
    })
    if (stickyEl) {
        stickyLetterTile.css({ visibility: "visible", top: `calc(${overthrowingEl ? overthrowingEl.offsetTop - scroll - wInsets.top - 64 : 0}px + var(--window-inset-top))`, "--transform": overthrowingEl ? overthrowingEl.offsetTop - scroll - wInsets.top - 64 + "px" : "0px" })
        stickyLetterTile.children("p.groove-app-tile-icon").text(stickyEl.getAttribute("icon"))
        if (scroll >= 21) document.querySelector("div.app-list").classList.add("hide-back"); else document.querySelector("div.app-list").classList.remove("hide-back");
        document.querySelector("div.app-list").style.clipPath = `inset(calc(0px + var(--window-inset-top) + 64px + ${overthrowingEl ? overthrowingEl.offsetTop - scroll - wInsets.top - 64 : 0}px) 0 0 0)`
    } else {
        stickyLetterTile.css({ visibility: "hidden" })
        document.querySelector("div.app-list").classList.remove("hide-back")
    }
    window.stickyLetterTimeout = setTimeout(() => {
    }, 10);
}

const appSearchNoResult = document.querySelector("div.app-search-no-result")
async function updateLocaleInfo() {
    appListSearch.attr("placeholder", i18n.toLowerCase(i18n.t("common.search.title")))
    appSearchNoResult.innerHTML = i18n.t("common.search.no_results", {
        query: `<span style="color: var(--accent-color);">SEARCH</span>`
    })
}
updateLocaleInfo()
window.addEventListener("localeChanged", async () => {
    await i18n.init(true)
    updateLocaleInfo()
})
window.addEventListener("localeLoaded", updateLocaleInfo)