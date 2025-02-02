import "../../../scripts/shared/internal-app";

import fontStore from "../../../scripts/fontStore";
import i18n from "../../../scripts/localeManager";
document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    appViewEvents.setReduceMotion(e.target.hasAttribute("checked"))
})
document.querySelector("div.high-contrast-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    appViewEvents.setHighContrast(e.target.hasAttribute("checked"))
})
document.querySelector("div.haptic-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    localStorage.setItem("hapticFeedback", e.target.hasAttribute("checked"))
    if (e.target.hasAttribute("checked")) {
        Groove.triggerHapticFeedback("ENABLED")
    } else {
        lGroove.triggerHapticFeedback("DISABLED")
    }
})


function handleFileInput(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fontData = new Uint8Array(e.target.result);
            fontStore.saveFont(file.name, fontData).then(() => {
                //alert('Font saved successfully!');
                document.getElementById("font-chooser").selectOption(2)
                parent.GrooveBoard.backendMethods.font.set(2)
                document.getElementById("clearfont").style.visibility = "visible"
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"
                lastX = -9999
                setTimeout(() => {
                    lastX = -9999
                }, 100);
            });
        };

        reader.onerror = function () {
            parent.GrooveBoard.alert(
                window.i18n.t("settings.alerts.font_read_error.title"),
                window.i18n.t("settings.alerts.font_read_error.message"),
                [, { title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
            );
        };

        reader.readAsArrayBuffer(file);
    } else {
        parent.GrooveBoard.alert(
            window.i18n.t("settings.alerts.font_load_error.title"),
            window.i18n.t("settings.alerts.font_load_error.message"),
            [, { title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
        );
    }
}
document.getElementById("font-chooser").querySelector("input").addEventListener('change', handleFileInput);
// Attach the event listener to the file input
/*ocument.getElementById("display-scaling-chooser").addEventListener("selected", (e) => {
    const options = [.8, .9, 1, 1.1, 1.25]
    appViewEvents.setUIScale(options[e.detail.index])
})*/
document.getElementById("font-chooser").addEventListener("selected", (e) => {
    const index = e.detail.index
    const lastOne = index == document.getElementById("font-chooser").children.length - 1
    if (lastOne) {
        fontStore.hasFont().then(value => {
            if (value) {
                parent.GrooveBoard.backendMethods.font.set(2)
            } else {
                document.getElementById("font-chooser").selectOption(e.detail.prevIndex)
                document.getElementById("font-chooser").querySelector("input").dispatchEvent(new MouseEvent("click"))
            }
        })
    } else {
        parent.GrooveBoard.backendMethods.font.set(index)
    }
    lastX = -9999
    setTimeout(() => {
        lastX = -9999
    }, 100);
})

setTimeout(() => {
    if (localStorage["reducedMotion"] == "true") {
        document.querySelector("div.reduce-motion-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.reduce-motion-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
        document.body.classList.add("reduced-motion")
    }
    if (localStorage["highContrast"] == "true") {
        document.querySelector("div.high-contrast-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.high-contrast-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
        document.body.classList.add("high-contrast")
    }
    if (!!localStorage.getItem("UIScale")) {
        const uiscale = Number(localStorage.getItem("UIScale"))
        document.getElementById("display-scaling-chooser").selectOption(uiscale == .8 ? 0 : uiscale == .9 ? 1 : uiscale == 1 ? 2 : uiscale == 1.1 ? 3 : 4)
    }
    if (!!localStorage.getItem("font")) {
        const font = Number(localStorage.getItem("font"))
        document.getElementById("font-chooser").selectOption(font)
        window.setFont(font)
        fontStore.hasFont().then((value) => {
            if (value || localStorage["customFontName"]) {
                document.getElementById("clearfont").classList.remove("hidden")
                document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = localStorage["customFontName"] || "custom font"

            } else {
                document.getElementById("clearfont").classList.add("hidden")
            }
        });
    } else {
        document.getElementById("clearfont").classList.add("hidden")

    }
    if (localStorage.getItem("hapticFeedback") != "false") {
        document.querySelector("div.haptic-toggle-switch > p").innerText = i18n.t("common.actions.on")
        document.querySelector("div.haptic-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
    }
}, 500);    //reduce-motion-toggle-switch
if (!!localStorage.getItem("font")) {
    const font = Number(localStorage.getItem("font"))
    window.setFont(font)
}
document.getElementById("clearfont").addEventListener("flowClick", () => {
    fontStore.clearFont()
    document.querySelector("#font-chooser > div:nth-child(3) > span.name").innerText = i18n.t("settings.ease_of_access.font.choose")
    document.getElementById("clearfont").classList.add("hidden")
    window.setFont(0)
    document.getElementById("font-chooser").selectOption(0)
    parent.GrooveBoard.backendMethods.font.set(0)
    lastX = -9999
    setTimeout(() => {
        lastX = -9999
    }, 100);
})