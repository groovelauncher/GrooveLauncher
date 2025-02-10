import GrooveBoard from "./GrooveBoard"

// Configuration object for all animation-related settings
const CONFIG = {
    ANIMATION: {
        BASE_TIMEOUT: 1000,
        ERROR_TIMEOUT: 1000,
        VISIBILITY_MARGIN: {
            height: 1,
            width: 1
        }
    },
    SELECTORS: {
        MAIN_SLIDER: '#main-home-slider',
        APP_TILES: 'div.app-list-container > div.groove-element.groove-app-tile:not(.search-hidden)',
        HOME_TILES: 'div.tile-list-inner-container > div.groove-element.groove-home-tile',
        TILE_CONTAINER: 'div.tile-list-container',
        STICKY_LETTER: '#sticky-letter',
        SEARCH_ICON: '#search-icon',
        ICON_BANNER: 'div.app-page-icon-banner'
    },
    CLASSES: {
        TRANSITION: {
            BASE: 'app-transition',
            BACK: 'app-transition-back',
            RESUME: 'app-transition-on-resume',
            PAUSE: 'app-transition-on-pause',
            TILE_LIST: 'app-transition-tile-list',
            APP_LIST: 'app-transition-app-list'
        }
    }
};

// Cache frequently used DOM elements for better performance
const mainHomeSlider = document.getElementById(CONFIG.SELECTORS.MAIN_SLIDER.slice(1));

// Animation timing calculations
const ANIMATION_TIMINGS = {
    // Calculate base scale based on window height
    baseScale: () => window.innerHeight / 850 / 2 + 0.5,
    // Calculate launch hide timing with scale factor
    // calc(.3s * var(--animation-duration-scale)) calc((var(--app-animation-index) * .3s * var(--app-transition-scale)) * var(--animation-duration-scale))
    launchHide: function () {
        const animationDurationScale = GrooveBoard.backendMethods.animationDurationScale.get();
        const appTransitionScale = this.baseScale()
        const ms = (.2 * animationDurationScale) + (.2 * appTransitionScale * animationDurationScale) + .2 * animationDurationScale + .1
        return ms * 1000;
        return ((0.3 * this.baseScale() + 0.35) * 1000 + 500) * GrooveBoard.backendMethods.animationDurationScale.get()
    }
};

// Check if an element is visible within the viewport
function isElementVisible(el) {
    try {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top >= (-rect.height * CONFIG.ANIMATION.VISIBILITY_MARGIN.height) &&
            rect.left >= (-rect.width * CONFIG.ANIMATION.VISIBILITY_MARGIN.width) &&
            rect.bottom <= (viewHeight + rect.height * CONFIG.ANIMATION.VISIBILITY_MARGIN.height) &&
            rect.right <= (viewWidth + rect.width * CONFIG.ANIMATION.VISIBILITY_MARGIN.width)
        );
    } catch (error) {
        console.error('Error checking element visibility:', error);
        return false;
    }
}

// Calculate the center coordinates of an element
function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Clean up animation classes from elements
function removeAnimClasses() {
    const classesToRemove = Object.values(CONFIG.CLASSES.TRANSITION);
    mainHomeSlider.classList.remove(...classesToRemove);
    document.querySelectorAll('.groove-home-tile').forEach(e => e.classList.remove('active'));
}

// Get the current horizontal offset of the app page
function appPageOffset() {
    const container = document.querySelector(CONFIG.SELECTORS.TILE_CONTAINER);
    return container ? container.getBoundingClientRect().left : 0;
}

// Set animation indices for elements based on their visibility
function indexElements(page) {
    // Reset all animation properties
    document.querySelectorAll(`${CONFIG.SELECTORS.APP_TILES}, ${CONFIG.SELECTORS.HOME_TILES}`).forEach(element => {
        element.style.removeProperty('--app-animation-index');
        element.style.removeProperty('--app-animation-distance');
    });

    const elements = page
        ? document.querySelectorAll(CONFIG.SELECTORS.APP_TILES)
        : tileListGrid.engine.nodes.map(e => e.el);

    const visibleElements = Array.from(elements).filter(isElementVisible);

    if (page) {
        // Handle app page elements
        const stickyLetter = document.querySelector(CONFIG.SELECTORS.STICKY_LETTER);
        const searchIcon = document.querySelector(CONFIG.SELECTORS.SEARCH_ICON);

        if (stickyLetter) visibleElements.unshift(stickyLetter);
        if (searchIcon) visibleElements.unshift(searchIcon);

        visibleElements.reverse().forEach((element, index) => {
            const normalizedIndex = (index / (visibleElements.length - 1)).toFixed(2);
            setElementAnimationProperties(element, normalizedIndex);
        });
    } else {
        // Handle tile list elements
        const iconBanner = document.querySelector(CONFIG.SELECTORS.ICON_BANNER);
        if (iconBanner) visibleElements.push(iconBanner);

        visibleElements.reverse().forEach((element, index) => {
            const normalizedIndex = (index / (visibleElements.length - 1)).toFixed(2);
            setElementAnimationProperties(element, normalizedIndex, true);
        });
    }
}

// Set CSS properties for element animations
function setElementAnimationProperties(element, index, includePage = false) {
    element.style.setProperty('--app-animation-index', index);
    element.style.setProperty('--app-animation-distance', -element.offsetLeft + 'px');
    if (includePage) {
        element.style.setProperty('--app-page-distance', -appPageOffset() + 'px');
    }
}

// Main animation controller object
const appTransition = {
    // Handle app pause state
    onPause: () => {
        mainHomeSlider.classList.remove(CONFIG.CLASSES.TRANSITION.RESUME);
        mainHomeSlider.classList.add(CONFIG.CLASSES.TRANSITION.PAUSE);

        clearTimeout(window.appTransitionLaunchError);
        window.appTransitionLaunchError = setTimeout(() => {
            appTransition.onResume(true);
        }, ANIMATION_TIMINGS.launchHide() + CONFIG.ANIMATION.ERROR_TIMEOUT);

        startAnim();

        setTimeout(() => {
            scrollers.main_home_scroller.scrollTo(0, 0);
            mainHomeSlider.style.visibility = 'hidden';
            mainHomeSlider.classList.add('visibility-hidden');

            document.querySelectorAll('.app-transition-selected')
                .forEach(e => e.classList.remove('app-transition-selected'));
        }, ANIMATION_TIMINGS.launchHide());
    },

    // Handle app resume state
    onResume: (back = false, firstIntro = false) => {
        mainHomeSlider.style.removeProperty('visibility');
        mainHomeSlider.classList.remove('visibility-hidden');
        clearTimeout(window.appTransitionLaunchError);
        if (document.body.classList.contains("rtl")) scrollers.main_home_scroller.scrollTo(-window.innerWidth, 0); else scrollers.main_home_scroller.scrollTo(0, 0);
        mainHomeSlider.classList.remove(CONFIG.CLASSES.TRANSITION.PAUSE);
        mainHomeSlider.classList.add(CONFIG.CLASSES.TRANSITION.RESUME);

        startAnim();

        if (back) mainHomeSlider.classList.add(CONFIG.CLASSES.TRANSITION.BACK);
        if (firstIntro) mainHomeSlider.style.removeProperty('visibility');

        setTimeout(removeAnimClasses, (CONFIG.ANIMATION.BASE_TIMEOUT) * GrooveBoard.backendMethods.animationDurationScale.get());
    },
    reset: () => {
        removeAnimClasses();
        mainHomeSlider.style.removeProperty('visibility');
        mainHomeSlider.classList.remove('visibility-hidden');
        clearTimeout(window.appTransitionLaunchError);
    }
};

// Start the animation sequence
function startAnim() {
    const page = window.scrollers.main_home_scroller.getCurrentPage().pageX;
    indexElements(page);
    mainHomeSlider.classList.add(CONFIG.CLASSES.TRANSITION.BASE);

    const addClass = page ? CONFIG.CLASSES.TRANSITION.APP_LIST : CONFIG.CLASSES.TRANSITION.TILE_LIST;
    const removeClass = page ? CONFIG.CLASSES.TRANSITION.TILE_LIST : CONFIG.CLASSES.TRANSITION.APP_LIST;

    mainHomeSlider.classList.remove(removeClass);
    mainHomeSlider.classList.add(addClass);
}

export default appTransition;