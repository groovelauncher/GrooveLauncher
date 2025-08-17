const pmtryagaian = {
    root: () => {
        var firstanswer = Groove.isDeviceRooted()
        setTimeout(() => {
            var secondanswer = Groove.isDeviceRooted()
            if (secondanswer === "true") {
                parent.GrooveBoard.backendMethods.packageManagerProvider.set(1)
            } else {
                parent.GrooveBoard.alert(
                    "Root Access Required",
                    "Root access is required to perform this action. Please grant root access to continue.",
                    [{
                        title: "Try again", style: "default", inline: true, action: () => {
                            pmtryagaian.root()
                        }
                    }, { title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
                );
                document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())
            }
        }, 1000);
    },
    shizuku: () => {
        var firstanswer = Groove.isShizukuAvailable()
        setTimeout(() => {
            var secondanswer = Groove.isShizukuAvailable()
            if (secondanswer === "true") {
                parent.GrooveBoard.backendMethods.packageManagerProvider.set(2)
            } else {
                parent.GrooveBoard.alert(
                    "Shizuku Permission Required",
                    "Shizuku permission is required to perform this action. Please grant Shizuku permission to continue.",
                    [{
                        title: "Try again", style: "default", inline: true, action: () => {
                            pmtryagaian.shizuku()
                        }
                    }, { title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
                );
                document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())
            }
        }, 1000);
    }
}
document.getElementById("pm-chooser").addEventListener('selected', (e) => {
    switch (e.detail.index) {
        case 0:
            parent.GrooveBoard.backendMethods.packageManagerProvider.set(0)
            break;
        case 1:
            pmtryagaian.root()
            break;
        case 2:
            pmtryagaian.shizuku()
            break;
    }
});

document.querySelector("#dumpbtn").addEventListener("flowClick", async () => {
    try {

        if (await Groove.copyToClipboard(JSON.stringify(window.parent.allappsarchive))) {
            parent.GrooveBoard.alert(
                window.i18n.t("settings.alerts.copy_success.title"),
                window.i18n.t("settings.alerts.copy_success.message"),
                [{ title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
            );
        } else {
            parent.GrooveBoard.alert(
                window.i18n.t("settings.alerts.copy_failed.title"),
                window.i18n.t("settings.alerts.copy_failed.message"),
                [{ title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
            );
        }

    } catch (error) {
        parent.GrooveBoard.alert(
            window.i18n.t("settings.alerts.copy_failed.title"),
            window.i18n.t("settings.alerts.copy_failed.message"),
            [{ title: window.i18n.t("common.actions.ok"), style: "default", inline: true, action: () => { } }]
        );
    }
})
if (parent.GrooveBoard) document.getElementById("pm-chooser").selectOption(parent.GrooveBoard.backendMethods.packageManagerProvider.get())

document.querySelector("div.double-tap-sleep-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    localStorage.setItem("doubleTapSleep", e.target.hasAttribute("checked"))
})
document.querySelector("div.alternative-wallpaper-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    localStorage.setItem("alternativeWallpaper", e.target.hasAttribute("checked"))
    window.parent.GrooveBoard.backendMethods.wallpaper.alternative()
})
document.querySelector("div.force-rtl-toggle-switch > div > .metro-toggle-switch").addEventListener("checked", (e) => {
    e.target.parentNode.parentNode.querySelector("p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    localStorage.setItem("forceRTL", e.target.hasAttribute("checked"))
    if (localStorage.getItem("textDirection") == "rtl" || localStorage.getItem("forceRTL") == "true"){
        window.parent.GrooveBoard.backendMethods.setTextDirection("rtl");
        window.parent.GrooveBoard.backendMethods.setTextDirection("rtl");
    }  else {
        window.parent.GrooveBoard.backendMethods.setTextDirection("ltr");
        window.parent.GrooveBoard.backendMethods.setTextDirection("ltr");
    }

})

if (localStorage["doubleTapSleep"] == "true") {
    document.querySelector("div.double-tap-sleep-toggle-switch > p").innerText = i18n.t("common.actions.on")
    document.querySelector("div.double-tap-sleep-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
}
if (localStorage["alternativeWallpaper"] == "true") {
    document.querySelector("div.alternative-wallpaper-toggle-switch > p").innerText = i18n.t("common.actions.on")
    document.querySelector("div.alternative-wallpaper-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
}
if (localStorage["forceRTL"] == "true") {
    document.querySelector("div.force-rtl-toggle-switch > p").innerText = i18n.t("common.actions.on")
    document.querySelector("div.force-rtl-toggle-switch > div > .metro-toggle-switch").setAttribute("checked", "")
}