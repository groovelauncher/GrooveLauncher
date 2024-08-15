import jQuery from "jquery";
window.$ = jQuery
import appTransition from "./scripts/appTransition.js";
import clickDetectorConfig from "./scripts/clickDetector.js";
import BScroll from "better-scroll";
import { boardMethods } from "./scripts/GrooveBoard";
import startUpSequence from "./scripts/startUpSequence";
import detectDeviceType from "./scripts/detectDeviceType";
import GrooveBoard from "./scripts/GrooveBoard";
import iconPackConverter from "./scripts/iconPack.js";
import "./scripts/pages/appList.js"
import "./scripts/pages/tileList.js"
import { normalizeSync } from 'normalize-diacritics';
window.normalizeDiacritics = (input = "") => {
    return normalizeSync(input)
}
import GrooveMock from "./scripts/GrooveMock.js";
import { grooveThemes } from "./scripts/GrooveProperties.js";

const GrooveMockInstance = !window.Groove
if (GrooveMockInstance) {
    window.Groove = new GrooveMock("./mock/apps.json")
}
var allappsarchive = []
window["allappsarchive"] = allappsarchive

window.appTransition = appTransition
window.GrooveBoard = GrooveBoard
const scrollers = {
    main_home_scroller: new BScroll('#main-home-slider', {
        scrollX: true,
        scrollY: false,
        click: true,
        tap: true,
        bounce: false,
        disableMouse: false,
        disableTouch: false,
        HWCompositing: false,
        slide: {
            threshold: 100,
            loop: false,
            interval: false,
            autoplay: false,
            easing: "cubic-bezier(0.075, 0.82, 0.165, 1)"
        },
    }),
    tile_page_scroller: new BScroll('#main-home-slider > div > div:nth-child(1) > div.inner-page', {
        scrollX: false,
        scrollY: true,
        mouseWheel: true,
        disableMouse: false,
        disableTouch: false,
        HWCompositing: false,
    }),
    app_page_scroller: new BScroll('#main-home-slider > div > div:nth-child(2) > div > div.app-list', {
        scrollX: false,
        scrollY: true,
        mouseWheel: true,
        disableMouse: false,
        disableTouch: false,
        HWCompositing: false,
    })
}
function cancelScroll(scroller) {
    scroller.scrollTo(null)
}
window.scrollers = scrollers
window.cancelScroll = cancelScroll

window.console.image = function (url, size = 100) {
    if (typeof url == "string") {
        const image = url
        var style = [
            'font-size: 1px;',
            'padding: ' + this.height / 100 * size + 'px ' + this.width / 100 * size + 'px;',
            'background: url(' + url + ') no-repeat;',
            'background-size: contain;'
        ].join(' ');
        console.log('%c ', style);
    } else {
        const image = new Image();
        image.src = url;
        image.onload = function () {
            var style = [
                'font-size: 1px;',
                'padding: ' + this.height / 100 * size + 'px ' + this.width / 100 * size + 'px;',
                'background: url(' + url + ') no-repeat;',
                'background-size: contain;'
            ].join(' ');
            console.log('%c ', style);
        };
    }
};

$(window).on("systemInsetsChange", function () {
    console.log("ay hemen düzelt gülüm")
    GrooveBoard.backendMethods.refreshInsets()
})
GrooveBoard.backendMethods.refreshInsets()
$(window).on("resize", () => {
    $(":root").css({ "--window-width": window.innerWidth + "px", "--window-height": window.innerHeight + "px", "--window-hypotenuse": (Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))) + "px" })
})
$(":root").css({ "--window-width": window.innerWidth + "px", "--window-height": window.innerHeight + "px", "--window-hypotenuse": (Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))) + "px" })

scrollers.main_home_scroller.on("slideWillChange", function (e) {
    if (e.pageX == 0) {
        if (GrooveBoard.backendMethods.navigation.lastPush.change == "appMenuOpened") {
            GrooveBoard.backendMethods.navigation.back()
        }
    } else {
        GrooveBoard.backendMethods.navigation.push("appMenuOpened", () => { }, () => {
            scrollers.main_home_scroller.scrollTo(0, 0, 500)
        })
    }
})


function getRandomMultiplier() {
    // Returns -1, 0, or 1
    return Math.floor(Math.random() * 3) - 1;
}

function createShakeKeyframes(n) {
    const firsttwo = [getRandomMultiplier(), getRandomMultiplier()]
    return `
        @keyframes home-edit-mode-shake${n} {
            0% {
                transform: scale(var(--shake-scale-distance)) translate(calc(${firsttwo[0]} * var(--shake-distance)), calc(${firsttwo[1]} * var(--shake-distance)));
            }
            33% {
                transform: scale(var(--shake-scale-distance)) translate(calc(${getRandomMultiplier()} * var(--shake-distance)), calc(${getRandomMultiplier()} * var(--shake-distance)));
            }
            66% {
                transform: scale(var(--shake-scale-distance)) translate(calc(${getRandomMultiplier()} * var(--shake-distance)), calc(${getRandomMultiplier()} * var(--shake-distance)));
            }
            100% {
                transform: scale(var(--shake-scale-distance)) translate(calc(${firsttwo[0]} * var(--shake-distance)), calc(${firsttwo[1]} * var(--shake-distance)));
            }
        }
    `;
}

function generateShakeAnimations() {
    return
    document.querySelectorAll("style.shake-anim-styles").forEach(i => i.remove())

    const styleSheet = document.createElement('style');
    styleSheet.classList.add("shake-anim-styles")
    document.head.appendChild(styleSheet);
    $("div.groove-home-tile").each((index, element) => {
        element.style.setProperty("--shake-duration", (Math.floor(Math.random() * 6) + 3) + "s")
    })
    for (let i = 0; i <= 5; i++) {

        const keyframes = createShakeKeyframes(i);

        styleSheet.innerHTML += keyframes;
    }
}

window.generateShakeAnimations = generateShakeAnimations

window.addEventListener("activityPause", () => {
    clearTimeout(window.appTransitionLaunchError)
})
window.addEventListener("activityResume", () => {
    setTimeout(() => {
        appTransition.onResume()
    }, 200);
})


startUpSequence([
    (next) => {
        setTimeout(next, 500);
        GrooveBoard.backendMethods.navigation.push("homescreen", () => { }, () => { })

    },
    (next) => {
        window.iconPackDB = {}
        iconPackConverter.forEach(icon => {
            icon.apps.forEach(packageName => {
                window.iconPackDB[packageName] = { icon: icon.icon, pack: icon.pack }
            });
        });
        next()
    },
    (next) => {
        detectDeviceType();
        GrooveBoard.backendMethods.reloadApps()
        next()
    },
    (next) => {
        window.scrollers.tile_page_scroller.refresh()
        window.scrollers.app_page_scroller.refresh()
        next()
    },
    (next) => {
        GrooveBoard.backendMethods.setTheme(grooveThemes.dark);
        next()
    },
    (next) => {
        const letter_selector_entries = ["#abcdefghijklmnopqrstuvwxyz"]
        const groupedEntries = [];

        for (let i = 0; i < letter_selector_entries[0].length; i += 4) {
            groupedEntries.push(letter_selector_entries[0].slice(i, i + 4));
        }

        const letterSelectorDiv = $('.letter-selector');

        groupedEntries.forEach(group => {
            const $rowDiv = $('<div>', { class: 'letter-selector-row' });

            for (let letter of group) {
                const $letterDiv = $('<div>', { class: 'letter-selector-letter', text: letter });
                $rowDiv.append($letterDiv);
            }

            letterSelectorDiv.append($rowDiv);
        });
        next()
    }
],
    function () {
        setTimeout(() => {
            GrooveBoard.boardMethods.finishLoading()
        }, 100);
    }
)