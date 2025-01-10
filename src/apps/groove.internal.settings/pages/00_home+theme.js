import imageStore from "../../../scripts/imageStore";
import i18n from "../../../scripts/localeManager";
import iro from '@jaames/iro';

const urlParams = new URLSearchParams(window.location.search);
const settingsListTag = document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(1) > p.groove-list-view-item-description")

document.querySelector("#device-placeholder > svg:nth-child(2)").classList.remove("selected")
document.querySelector("#device-placeholder > svg:nth-child(3)").classList.remove("selected")


document.getElementById("theme-chooser").addEventListener('selected', (e) => {
    appViewEvents.setTheme(e.detail.index == 0 ? grooveThemes.light : grooveThemes.dark)
});
const accentColorPicker = document.getElementById("accent-color-picker")
document.querySelector("div.color-picker").addEventListener("flowClick", (e) => {
    clearTimeout(window.accentColorPickerTimeout)
    accentColorPicker.classList.add("shown-animation", "shown")
    window.parent.GrooveBoard.backendMethods.navigation.push("settings-inner-page:accent-color-picker", () => { }, () => {
        clearTimeout(window.accentColorPickerTimeout)
        accentColorPicker.classList.remove("shown")
        accentColorPicker.classList.add("hidden")
        window.accentColorPickerTimeout = setTimeout(() => {
            accentColorPicker.classList.remove("shown-animation", "hidden")

        }, 500 * animationDurationScale);
        Array.from({ length: 6 }, (_, i) => {
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK");
            }, (i * 20 + 60) * window.parent.GrooveBoard.backendMethods.animationDurationScale.get());
        });
    })
    Array.from({ length: 6 }, (_, i) => {
        setTimeout(() => {
            Groove.triggerHapticFeedback("CLOCK_TICK");
        }, i * 20 * window.parent.GrooveBoard.backendMethods.animationDurationScale.get());
    });
    const systemColorTile = document.querySelector("#accent-color-picker > div.accent-color-catalogue > div > div:nth-child(6) > div:nth-child(2)")
    if (Groove.getSystemAccentColor("supported") == "true") {
        systemColorTile.style.visibility = "visible"
        systemColorTile.style.background = Groove.getSystemAccentColor()
        systemColorTile.innerHTML = '<p class="system-accent-color"></p>'
        systemColorTile.querySelector("p.system-accent-color").innerText = Groove.getSystemAccentColor("provider")
    } else {
        systemColorTile.style.visibility = "hidden"
    }
})
document.querySelectorAll("div.accent-color-catalogue-item").forEach(e => e.addEventListener("flowClick", (e) => {
    if (e.target.id == "custom-color-item") {
        document.querySelector("div.custom-color-selector").style.removeProperty("display")
        document.querySelector("div.accent-color-catalogue").style.setProperty("display", "none")
        window.parent.GrooveBoard.backendMethods.navigation.push("settings-inner-page:accent-color-picker:custom-color", () => { }, () => {
            document.querySelector("div.custom-color-selector").style.setProperty("display", "none")
            document.querySelector("div.accent-color-catalogue").style.removeProperty("display")
            refreshColorScrollers()
        })
        refreshColorScrollers()
    } else {
        window.parent.GrooveBoard.backendMethods.navigation.invalidate("settings-inner-page:accent-color-picker")
        clearTimeout(window.accentColorPickerTimeout)
        accentColorPicker.classList.remove("shown")
        accentColorPicker.classList.add("hidden")
        window.accentColorPickerTimeout = setTimeout(() => {
            accentColorPicker.classList.remove("shown-animation", "hidden")

        }, 500 * animationDurationScale);
        Array.from({ length: 6 }, (_, i) => {
            setTimeout(() => {
                Groove.triggerHapticFeedback("CLOCK_TICK");
            }, (i * 20 + 60) * window.parent.GrooveBoard.backendMethods.animationDurationScale.get());
        });
        appViewEvents.setAccentColor(grooveColors[e.target.style.background.slice(18).slice(0, -1)])
        document.querySelector("div.color-picker > div.picker-option").innerText = i18n.t(`colors.${e.target.style.background.slice(18).slice(0, -1).toLowerCase()}`)
        settingsListTag.setAttribute("data-i18n", `colors.${e.target.style.background.slice(18).slice(0, -1).toLowerCase()}`)

    }
}))

document.getElementById("choose-wallpaper").querySelector("input").addEventListener('change', (event) => {
    window.parent.canPressHomeButton = false
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                document.getElementById("remove-wallpaper").style.removeProperty("visibility")

                window.parent.GrooveBoard.backendMethods.wallpaper.load(img)
            };
            document.getElementById("wallpaper-thumbnail").style.backgroundImage = `url(${e.target.result})`
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("choose-wallpaper").addEventListener("flowClick", (e) => {
    window.canPressHomeButton = false
    e.target.querySelector("input").dispatchEvent(new MouseEvent("click"))

})
const detectWallpaper = async () => {

    if (await imageStore.hasImage("wallpaper")) {
        document.getElementById("wallpaper-thumbnail").style.backgroundImage = `url(${window.parent.lastClippedWallpaper})`

    } else {

        document.getElementById("remove-wallpaper").style.visibility = "hidden";
    }
}
detectWallpaper();

document.getElementById("remove-wallpaper").addEventListener("flowClick", (e) => {
    document.getElementById("wallpaper-thumbnail").style.removeProperty("background-image")
    document.getElementById("remove-wallpaper").style.visibility = "hidden"
    window.parent.GrooveBoard.backendMethods.wallpaper.remove()
})
document.querySelector("#tile-toggle-switch").addEventListener("checked", (e) => {
    document.querySelector("#device-placeholder > svg:nth-child(2)").classList.remove("selected")
    document.querySelector("#device-placeholder > svg:nth-child(3)").classList.remove("selected")
    document.querySelector("div.tile-selector > p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    appViewEvents.setTileColumns(e.target.hasAttribute("checked") ? 6 : 4)
    if (e.target.hasAttribute("checked")) {
        document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
    } else {
        document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
    }
})
setTimeout(() => {
    if (!localStorage['accentColor']) {
        document.querySelector("div.color-picker > div.picker-option").innerText = i18n.t(`colors.violet`)
    } else {
        const colorName = Object.keys(grooveColors).find(key => grooveColors[key] == localStorage['accentColor']) || "custom_color";
        document.querySelector("div.color-picker > div.picker-option").innerText = i18n.t(`colors.${colorName.toLowerCase()}`);
        settingsListTag.setAttribute("data-i18n", `colors.${colorName.toLowerCase()}`)

    }
    if (urlParams.has("theme")) {
        document.querySelector("#theme-chooser").setAttribute("selected", urlParams.get("theme") == "light" ? 0 : 1)
        document.querySelector("#theme-chooser").selectOption(urlParams.get("theme") == "light" ? 0 : 1)
    }

    if (urlParams.has("tileColumns")) {
        document.querySelector("div.tile-selector > p").innerText = urlParams.get("tileColumns") == "4" ? i18n.t("common.actions.off") : i18n.t("common.actions.on")
        if (urlParams.get("tileColumns") != "4") {
            document.querySelector("#tile-toggle-switch").setAttribute("checked", "")
            document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
        } else {
            document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
        }
    }

}, 500);


if (!!localStorage['accentColor']) {
    const colorName = Object.keys(grooveColors).find(key => grooveColors[key] == localStorage['accentColor']) || "custom_color";
    settingsListTag.setAttribute("data-i18n", `colors.${colorName.toLowerCase()}`)
}

const colorPicker = new iro.ColorPicker("#iro-color-picker", {
    layout: [
        {
            component: iro.ui.Wheel
        }
    ]
})
window.colorPicker = colorPicker
var lastColorPicker = ""
const colorInputs = {
    hue: document.querySelector("#hue-input"),
    saturation: document.querySelector("#saturation-input"),
    value: document.querySelector("#value-input"),
    hex: document.querySelector("#hex-color-input")
}
const colorRanges = {
    hue: document.querySelector("#hue-range"),
    saturation: document.querySelector("#saturation-range"),
    value: document.querySelector("#value-range")
}
const colorNotSupportedText = document.querySelector("p.color-not-supported")
const applyColorButton = document.querySelector("button.apply-custom-color")
colorPicker.on(['color:init', 'color:change'], function (color) {
    if (lastColorPicker != color.hexString) {
        colorInputs.hex.value = color.hexString
        const hsv = colorPicker.color.hsv
        colorInputs.hue.value = hsv.h
        colorRanges.hue.value = hsv.h
        colorInputs.saturation.value = hsv.s
        colorRanges.saturation.value = hsv.s
        colorInputs.value.value = hsv.v
        colorRanges.value.value = hsv.v
        Object.values(colorRanges).forEach(e => e.dispatchEvent(new Event("change")))
    }

    if (isColorSupported(color.hexString)) {
        colorNotSupportedText.style.setProperty("display", "none")
        applyColorButton.style.removeProperty("display")
    } else {
        colorNotSupportedText.style.removeProperty("display")
        applyColorButton.style.setProperty("display", "none")
    }
});
Object.values(colorRanges).forEach(e => e.addEventListener("input", (e) => {
    const el = e.target;
    if (el["oldValue"] != el.value) {
        el.oldValue = el.value
        colorPicker.color.set({
            h: colorRanges.hue.value,
            s: colorRanges.saturation.value,
            v: colorRanges.value.value
        })
        colorInputs.hue.value = colorRanges.hue.value
        colorInputs.saturation.value = colorRanges.saturation.value
        colorInputs.value.value = colorRanges.value.value
    }

}))
Object.values(colorInputs).forEach(e => e.addEventListener("change", (e) => {
    if (e.target.id == "hex-color-input") return
    const el = e.target;
    el.value = Number(el.value)
    el.value = Math.floor(el.value)
    if (el["oldValue"] != el.value) {
        el.oldValue = el.value
        colorPicker.color.set({
            h: colorInputs.hue.value,
            s: colorInputs.saturation.value,
            v: colorInputs.value.value
        })
    }

}))
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        (bigint >> 16) & 255, // Red
        (bigint >> 8) & 255,  // Green
        bigint & 255          // Blue
    ];
}

function luminance([r, g, b]) {
    const toLinear = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hex1, hex2) {
    const lum1 = luminance(hexToRgb(hex1));
    const lum2 = luminance(hexToRgb(hex2));
    const [L1, L2] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
    return (L1 + 0.05) / (L2 + 0.05);
}

function isValidHexColor(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}
function isColorSupported(colorHex) {
    const blackContrast = contrastRatio(colorHex, "#000000");
    const whiteContrast = contrastRatio(colorHex, "#FFFFFF");
    return blackContrast >= 1.5 && whiteContrast >= 1.5;
}
colorInputs.hex.addEventListener("change", (e) => {
    if (isValidHexColor(e.target.value)) {
        colorPicker.color.set(e.target.value)
    } else {
        e.target.value = localStorage["accentColor"] ? (isValidHexColor(localStorage.accentColor) ? localStorage["accentColor"] : "#AA00FF") : "#AA00FF"
        colorPicker.color.set(e.target.value)

    }
})
function refreshColorScrollers() {
    scrollers.accentColorCatalogue.refresh();
    scrollers.customColorSelector.refresh();
    colorPicker.color.set(localStorage["accentColor"] ? (isValidHexColor(localStorage.accentColor) ? localStorage["accentColor"] : "#AA00FF") : "#AA00FF")
}
applyColorButton.addEventListener("flowClick", () => {
    const newColor = colorPicker.color.hexString.toUpperCase()
    if (!isColorSupported(newColor)) return
    window.parent.GrooveBoard.backendMethods.navigation.invalidate("settings-inner-page:accent-color-picker:custom-color")
    window.parent.GrooveBoard.backendMethods.navigation.invalidate("settings-inner-page:accent-color-picker")
    document.querySelector("div.custom-color-selector").style.setProperty("display", "none")
    document.querySelector("div.accent-color-catalogue").style.removeProperty("display")
    clearTimeout(window.accentColorPickerTimeout)
    accentColorPicker.classList.remove("shown")
    accentColorPicker.classList.add("hidden")
    window.accentColorPickerTimeout = setTimeout(() => {
        accentColorPicker.classList.remove("shown-animation", "hidden")

    }, 500);
    appViewEvents.setAccentColor(newColor)
    var colorName = "custom_color"
    if (Object.values(grooveColors).includes(newColor)) {
        colorName = Object.keys(grooveColors).find(key => grooveColors[key] == newColor)
    }
    document.querySelector("div.color-picker > div.picker-option").innerText = i18n.t(`colors.${colorName}`)
    settingsListTag.setAttribute("data-i18n", `colors.${colorName}`)
    refreshColorScrollers()

})
setTimeout(() => {
    document.querySelector("div.IroWheel").addEventListener("pointerdown", (e) => {
        scrollers.customColorSelector.cancelScroll()

    })

}, 1000);