import jQuery from "jquery";
window.$ = jQuery
import BScroll from "better-scroll";
import { BoardMethods } from "./scripts/GrooveBoard";
import startUpSequence from "./scripts/startUpSequence";
import detectDeviceType from "./scripts/detectDeviceType";
import GrooveBoard from "./scripts/GrooveBoard";
import iconPackConverter from "./scripts/iconPack.js";
import { BridgeMock, createDefaultBridgeMockConfig } from '@bridgelauncher/api-mock';
import "./scripts/pages/appList.js"
import { normalizeSync } from 'normalize-diacritics';
window.normalizeDiacritics = normalizeSync
const BridgeMockInstance = !window.Bridge
if (BridgeMockInstance) {
    window.Bridge = new BridgeMock(new createDefaultBridgeMockConfig());
    Bridge.config.logRaisedBridgeEvents = false
    Bridge.config.appsUrl = "mock/apps.json"
    Bridge.config.statusBarHeight = 0
    Bridge.config.navigationBarHeight = 0
}
var allappsarchive = []
window["allappsarchive"] = allappsarchive

const bridgeEvents = new Set();
// upon receiving an event, forward it to all listeners
window.onBridgeEvent = (...event) => {
  bridgeEvents.forEach((l) => l(...event));
};

window.GrooveBoard = GrooveBoard
const scrollers = {
    main_home_scroller: new BScroll('#main-home-slider', {
        scrollX: true,
        scrollY: false,
        click: true,
        tap: true,

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

    }),
    app_page_scroller: new BScroll('#main-home-slider > div > div:nth-child(2) > div > div.app-list', {
        scrollX: false,
        scrollY: true,
        mouseWheel: true,

        scrollbar: {
            minSize: 50,
            scrollbarTrackClickable: true,
            scrollbarTrackOffsetTime: 1000

        }

    })
}
window.scrollers = scrollers



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
bridgeEvents.add((name, args) => {
    //    console.log("WOWOWOWOWO", name, args)   // args will be strongly typed
    if (name != "systemBarsWindowInsetsChanged") return;
    console.log(args)
    GrooveBoard.BackendMethods.refreshInsets()
});
GrooveBoard.BackendMethods.refreshInsets()

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
],
    function () {
        setTimeout(() => {
            GrooveBoard.BoardMethods.finishLoading()
        }, 100);
    }
)
$(window).on("pointerdown", function (e) {
    e.target.classList.add("active")
})
$(window).on("pointerup", function (e) {
    $("*").removeClass("active")
})