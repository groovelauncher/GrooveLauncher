import "./scripts/bridgeMock.js"
import jQuery from "jquery";
window.$ = jQuery
import appTransition from "./scripts/appTransition.js";
import clickDetectorConfig from "./scripts/clickDetector.js";
import BScroll from "better-scroll";
import { BoardMethods } from "./scripts/GrooveBoard";
import startUpSequence from "./scripts/startUpSequence";
import detectDeviceType from "./scripts/detectDeviceType";
import GrooveBoard from "./scripts/GrooveBoard";
import iconPackConverter from "./scripts/iconPack.js";
import "./scripts/pages/appList.js"
import "./scripts/pages/tileList.js"
import { normalizeSync } from 'normalize-diacritics';
window.normalizeDiacritics = normalizeSync

import { BridgeMock, createDefaultBridgeMockConfig } from '@bridgelauncher/api-mock';

const BridgeMockInstance = !window.Bridge
if (BridgeMockInstance) {
    window.Bridge = new BridgeMock(new createDefaultBridgeMockConfig());
    Bridge.config.logRaisedBridgeEvents = false
    Bridge.config.appsUrl = "./mock/apps.json"
    Bridge.config.statusBarHeight = 0
    Bridge.config.navigationBarHeight = 0
}
var allappsarchive = []
window["allappsarchive"] = allappsarchive

const bridgeEvents = new Set();
window.bridgeEvents = bridgeEvents
// upon receiving an event, forward it to all listeners
window.onBridgeEvent = (...event) => {
    bridgeEvents.forEach((l) => l(...event));
};
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
    const scrollContainer = scroller.wrapper

    // To simulate a pointer up event
    const touchEndEvent = new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    // To simulate a pointer up event
    const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    scrollContainer.dispatchEvent(mouseUpEvent);
    scrollContainer.dispatchEvent(touchEndEvent);

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
window.windowInsets = document.body.windowInsets = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
};
/* OLD BRIDGE EVENT REMOVE
bridgeEvents.add((name, args) => {
    console.log("WOWOWOWOWO", name, args)   // args will be strongly typed
    if (name != "systemBarsWindowInsetsChanged") return;
    //    console.log(args)
    //GrooveBoard.BackendMethods.refreshInsets()
});
//GrooveBoard.BackendMethods.refreshInsets()
*/
$(window).on("systemInsetsChange",function () {
    console.log("ay hemen düzelt gülüm")
    GrooveBoard.BackendMethods.refreshInsets()
})
GrooveBoard.BackendMethods.refreshInsets()
$(window).on("resize", () => {
    $(":root").css({ "--window-width": window.innerWidth + "px", "--window-height": window.innerHeight + "px", "--window-hypotenuse": (Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))) + "px" })
})
$(":root").css({ "--window-width": window.innerWidth + "px", "--window-height": window.innerHeight + "px", "--window-hypotenuse": (Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))) + "px" })
startUpSequence([
    (next) => {
        setTimeout(next, 500);
    },
    (next) => {
        detectDeviceType();
        GrooveBoard.BackendMethods.reloadApps()
        next()
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
        window.scrollers.tile_page_scroller.refresh()
        window.scrollers.app_page_scroller.refresh()
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
            GrooveBoard.BoardMethods.finishLoading()
        }, 100);
    }
)

scrollers.main_home_scroller.on("slideWillChange", function (e) {
    if (e.pageX == 0) {
        if (GrooveBoard.BackendMethods.navigation.lastPush.change == "appMenuOpened") {
            GrooveBoard.BackendMethods.navigation.back()
        }
    } else {
        GrooveBoard.BackendMethods.navigation.push("appMenuOpened", () => { }, () => {
            scrollers.main_home_scroller.scrollTo(0, 0, 500)
        })
    }
    // history.pushState("applistopen", document.title, location.href);
})
/*
window.addEventListener('popstate', function (event) {
    console.log(event)
    if (event.state != "applistopen") {
        scrollers.main_home_scroller.scrollTo(0, 0, 500)
    }
    // scrollers.main_home_scroller.scrollTo(0,0,500)

});
*/
GrooveBoard.BackendMethods.navigation.push("homescreen", () => { }, () => { })


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
    document.querySelectorAll("style.shake-anim-styles").forEach(i => i.remove())

    const styleSheet = document.createElement('style');
    styleSheet.classList.add("shake-anim-styles")
    document.head.appendChild(styleSheet);
    $("div.groove-home-tile").each((index, element) => {
        element.style.setProperty("--shake-duration", (Math.floor(Math.random() * 2) + 1 * 6) + "s")
    })
    for (let i = 0; i <= 5; i++) {

        const keyframes = createShakeKeyframes(i);

        styleSheet.innerHTML += keyframes;
    }
}

// Call the function to generate the CSS rules and keyframes
window.generateShakeAnimations = generateShakeAnimations
bridgeEvents.add((name, args) => {
    if (name == "beforePause") {
        clearTimeout(window.appTransitionLaunchError)
    } else if (name == "afterResume") {
        setTimeout(() => {
            appTransition.onResume()
        }, 200);
    }
    else return;
});