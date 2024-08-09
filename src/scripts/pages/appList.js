import jQuery from "jquery";
var $ = jQuery
const appListPage = $("div.inner-page.app-list-page")
const appListSearch = $("input.app-list-search")
const letterSelector = $("div.letter-selector")
$("div.groove-element.groove-app-tile.groove-letter-tile")
const searchModeSwitch = {
    on: () => {
        GrooveBoard.BackendMethods.navigation.push("searchOn", () => { }, searchModeSwitch.off)
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
    },
    off: () => {
        GrooveBoard.BackendMethods.navigation.invalidate("searchOn")
        scrollers.main_home_scroller.enabled = true
        appListPage.removeClass("search-mode")
        appListPage[0].searchModeOffTimeout = setTimeout(() => {
            appListPage.removeClass("search-mode-animations")
            appListSearch.attr("disabled", "true")
        }, 250);
        scrollers.app_page_scroller.refresh()
        setTimeout(() => { scrollers.app_page_scroller.refresh(); appListSearch.val("") }, 500);
        appListPage.removeClass("no-search-result")
        $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").removeClass("search-hidden")
    }
}
const letterSelectorSwitch = {
    on: () => {
        GrooveBoard.BackendMethods.navigation.push("letterSelectOn", () => { }, letterSelectorSwitch.off)
        scrollers.main_home_scroller.enabled = false
        window.stopInsetUpdate = true
        const enabledones = Object.keys(window.appSortCategories).map(e => e == "0-9" ? "#" : e == "&" ? "" : e)
        $("div.letter-selector-letter").removeClass("disabled")

        $("div.letter-selector-letter").each((index, element) => {
            console.log(element)
            if (!enabledones.includes(element.innerText.toLocaleUpperCase("en"))) element.classList.add("disabled")
        })
        Bridge.requestSetStatusBarAppearance("hide")
        letterSelector.addClass("shown").addClass("shown-animation")
        setTimeout(() => {
            if (letterSelector.hasClass("shown")) letterSelector.removeClass("shown-animation")
        }, 500);
        $("div.letter-selector-row").each((index, element) => {
            $(element).css("--index", index)
        })
    },
    off: () => {
        GrooveBoard.BackendMethods.navigation.invalidate("letterSelectOn")
        scrollers.main_home_scroller.enabled = true
        Bridge.requestSetStatusBarAppearance("light-fg")
        letterSelector.removeClass("shown").addClass("shown-animation").addClass("hidden")
        setTimeout(() => {
            delete window.stopInsetUpdate

            if (letterSelector.hasClass("hidden")) letterSelector.removeClass("shown-animation").removeClass("hidden")

        }, 500);
    }
}
$("#search-icon").on("flowClick", function () {
    const searchModeOn = appListPage.hasClass("search-mode")
    if (searchModeOn) {
        searchModeSwitch.off()
    } else {
        searchModeSwitch.on()
    }

    console.log("sdgas")
})
$(window).on("finishedLoading", () => {
    window.scrollers.main_home_scroller.on("scrollStart", () => { searchModeSwitch.off(); console.log("hey") })
  /*  $(window).on("pointerdown", function (e) {
        if (!e.target.classList.contains("letter-selector-letter")) return
        console.log(e.target)
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
        setTimeout(() => {
            scrollers.main_home_scroller.enable()

        }, 1000);
    })
    $(window).on("pointerup", function (e) {
        if (!e.target.classList.contains("letter-selector-letter")) return

        console.log(e.target)
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
    })*/
    $("div.letter-selector-letter").on("flowClick", function (e) {
        if(e.target.classList.contains("disabled")) return
        letterSelectorSwitch.off()
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
    })
})
/*window.addEventListener('popstate', function (event) {
    console.log(event.state)
    searchModeSwitch.off()
});*/
appListSearch.on("input", function (e) {
    const search = window.normalizeDiacritics(this.value).toLocaleLowerCase("en")
    $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile)").each(function (index, element) {
        try {
            const app_title = window.normalizeDiacritics(element.title).toLocaleLowerCase("en")
            if (app_title.includes(search)) {
                $(element).removeClass("search-hidden")
            } else {
                $(element).addClass("search-hidden")
            }
        } catch (error) {

        }
    })
    console.log("search count:", $("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile):not(.search-hidden)").length)
    if ($("div.app-list-container > div.groove-app-tile:not(.groove-letter-tile):not(.search-hidden)").length == 0) {
        appListPage.addClass("no-search-result")
        $("div.app-search-no-result > span").text(this.value)

    } else {
        appListPage.removeClass("no-search-result")
    }
    scrollers.app_page_scroller.refresh()

})
$("div.app-search-search-store").click(() => {
    window.open("https://play.google.com/store/search?q=" + appListSearch[0].value, "_blank")

})

$(window).on("click", function (e) {
    if (!e.target.classList.contains("groove-letter-tile")) return
    letterSelectorSwitch.on()
})
