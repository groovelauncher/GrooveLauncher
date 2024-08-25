const getPage = () => window.scrollers.main_home_scroller.getCurrentPage().pageX
const mainHomeSlider = document.getElementById("main-home-slider")

function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= (-rect.height) &&
        rect.left >= (-rect.width) &&
        rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + rect.height) &&
        rect.right <= ((window.innerWidth || document.documentElement.clientWidth) + rect.width)
    );
}
function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}
function removeAnimClasses() {
    mainHomeSlider.classList.remove("app-transition", "app-transition-back", "app-transition-on-resume", "app-transition-on-pause", "app-transition-tile-list", "app-transition-app-list")
    document.querySelectorAll(".groove-home-tile").forEach(e => e.classList.remove("active"))
}
function appPageOffset() {
    return document.querySelector("div.tile-list-container").getBoundingClientRect().left
}
const indexElements = (page) => {
    document.querySelectorAll('div.app-list-container > div.groove-element.groove-app-tile:not(.search-hidden), div.tile-list-inner-container > div.groove-element.groove-home-tile').forEach(element => {
        element.style.removeProperty("--app-animation-index")
        element.style.removeProperty("--app-animation-distance")
    });
    var elements
    elements = page ? document.querySelectorAll('div.app-list-container > div.groove-element.groove-app-tile') : tileListGrid.engine.nodes.map(e => e.el)
    const visibleElements = Array.from(elements).filter(isElementVisible);
    if (page) {
        visibleElements.unshift(document.getElementById("sticky-letter"))
        visibleElements.unshift(document.getElementById("search-icon"))
        visibleElements.reverse().forEach((element, index) => {
            element.style.setProperty("--app-animation-index", (index / (visibleElements.length - 1)).toFixed(2))
            element.style.setProperty("--app-animation-distance", -element.offsetLeft + "px")

        });
    } else {
        visibleElements.push(document.querySelector("div.app-page-icon-banner"))
        visibleElements.reverse().forEach((element, index) => {
            element.style.setProperty("--app-animation-index", (index / (visibleElements.length - 1)).toFixed(2))
            element.style.setProperty("--app-animation-distance", -element.offsetLeft + "px")
            element.style.setProperty("--app-page-distance", -appPageOffset() + "px")

            return
            const elementBoundingClientRect = element.getBoundingClientRect()
            const elementPoint = { x: elementBoundingClientRect.left + elementBoundingClientRect.width, y: + elementBoundingClientRect.top + elementBoundingClientRect.height } //getElementCenter(element)
            const tileListPageBoundingClientRect = document.querySelector("div.inner-page.tile-list-page").getBoundingClientRect()
            const comparePoint = { x: tileListPageBoundingClientRect.width + tileListPageBoundingClientRect.left, y: tileListPageBoundingClientRect.height + tileListPageBoundingClientRect.top }
            const hypotenuse = Math.sqrt(Math.pow(elementPoint.x - comparePoint.x, 2) + Math.pow(elementPoint.y - comparePoint.y, 2))
            const diagonal = Math.sqrt(Math.pow(tileListPageBoundingClientRect.width, 2) + Math.pow(tileListPageBoundingClientRect.height, 2))
            element.style.setProperty("--app-animation-index", hypotenuse / diagonal)
            element.style.setProperty("--app-animation-distance", -element.offsetLeft + "px")

        });
    }
}
const startAnim = () => {
    const page = getPage()
    indexElements(page)
    mainHomeSlider.classList.add("app-transition")
    if (page) {
        mainHomeSlider.classList.remove("app-transition-tile-list")
        mainHomeSlider.classList.add("app-transition-app-list")
    } else {
        mainHomeSlider.classList.remove("app-transition-app-list")
        mainHomeSlider.classList.add("app-transition-tile-list")
    }
}
const appTransition = {
    onPause: () => {
        mainHomeSlider.classList.remove("app-transition-on-resume")
        mainHomeSlider.classList.add("app-transition-on-pause")
        clearTimeout(window.appTransitionLaunchError)
        window.appTransitionLaunchError = setTimeout(() => {
            appTransition.onResume(true)
        }, 2000);
        startAnim()
        setTimeout(() => {
            scrollers.main_home_scroller.scrollTo(0,0)
            mainHomeSlider.style.visibility = "hidden"
            console.log("hey")
            document.querySelectorAll(".app-transition-selected").forEach(e => e.classList.remove("app-transition-selected"))
        }, 600);
    },
    onResume: (back = false, firstintro = false) => {
        mainHomeSlider.style.removeProperty("visibility")
        clearTimeout(window.appTransitionLaunchError)
        scrollers.main_home_scroller.scrollTo(0, 0)
        mainHomeSlider.classList.remove("app-transition-on-pause")
        mainHomeSlider.classList.add("app-transition-on-resume")
        startAnim()
        if (back) mainHomeSlider.classList.add("app-transition-back")
        if (firstintro) mainHomeSlider.style.removeProperty("visibility")

        setTimeout(() => {
            removeAnimClasses()
        }, 1000);
    }
}

export default appTransition