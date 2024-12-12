const pmtryagaian = {
    root: () => {
        var firstanswer = Groove.isDeviceRooted()
        setTimeout(() => {
            var secondanswer = Groove.isDeviceRooted()
            if (secondanswer) {
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
            if (secondanswer) {
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
