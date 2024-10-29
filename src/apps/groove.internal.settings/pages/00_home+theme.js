import imageStore from "../../../scripts/imageStore";

const urlParams = new URLSearchParams(window.location.search);


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

        }, 500);
    })
})
document.querySelectorAll("div.accent-color-catalogue-item").forEach(e => e.addEventListener("flowClick", (e) => {
    clearTimeout(window.accentColorPickerTimeout)
    accentColorPicker.classList.remove("shown")
    accentColorPicker.classList.add("hidden")
    window.accentColorPickerTimeout = setTimeout(() => {
        accentColorPicker.classList.remove("shown-animation", "hidden")

    }, 500);
    appViewEvents.setAccentColor(grooveColors[e.target.style.background.slice(18).slice(0, -1)])
    document.querySelector("div.color-picker > div.picker-option").innerText = e.target.style.background.slice(18).slice(0, -1)
    document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(1) > p.groove-list-view-item-description").innerText = e.target.style.background.slice(18).slice(0, -1)

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
    document.querySelector("div.tile-selector > p").innerText = e.target.hasAttribute("checked") ? "On" : "Off"
    appViewEvents.setTileColumns(e.target.hasAttribute("checked") ? 6 : 4)
    if (e.target.hasAttribute("checked")) {
        document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
    } else {
        document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
    }
})
setTimeout(() => {
    if (!localStorage['accentColor']) {
        document.querySelector("div.color-picker > div.picker-option").innerText = "violet"
    } else {
        const colorName = Object.keys(grooveColors).find(key => grooveColors[key] == localStorage['accentColor']) || "custom color";
        document.querySelector("div.color-picker > div.picker-option").innerText = colorName;
        document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(1) > p.groove-list-view-item-description").innerText = colorName
    }
    if (urlParams.has("theme")) {
        document.querySelector("#theme-chooser").setAttribute("selected", urlParams.get("theme") == "light" ? 0 : 1)
        document.querySelector("#theme-chooser").selectOption(urlParams.get("theme") == "light" ? 0 : 1)
    }

    if (urlParams.has("tileColumns")) {
        document.querySelector("div.tile-selector > p").innerText = urlParams.get("tileColumns") == "4" ? "Off" : "On"
        if (urlParams.get("tileColumns") != "4") {
            document.querySelector("#tile-toggle-switch").setAttribute("checked", "")
            document.querySelector("#device-placeholder > svg:nth-child(3)").classList.add("selected")
        } else {
            document.querySelector("#device-placeholder > svg:nth-child(2)").classList.add("selected")
        }
    }

}, 500);

if (!!localStorage['accentColor']) {
    const colorName = Object.keys(grooveColors).find(key => grooveColors[key] == localStorage['accentColor']) || "custom color";
    document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(1) > p.groove-list-view-item-description").innerText = colorName
}