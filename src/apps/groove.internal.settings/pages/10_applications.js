document.querySelector("#uninstallappbutton").addEventListener("flowClick", e => {
    const packageName = window.lastSelectedApp.packageName
    if (parent.GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
        Groove.uninstallApp(packageName, 0);
        pageNavigation.settingsHome()
    } else {
        parent.GrooveBoard.alert(
            window.i18n.t("common.alerts.uninstall.title"),
            window.i18n.t("common.alerts.uninstall.message"),
            [{
                title: window.i18n.t("common.actions.yes"), style: "default", inline: true, action: () => {
                    Groove.uninstallApp(packageName, parent.GrooveBoard.backendMethods.packageManagerProvider.get());
                    pageNavigation.settingsHome()
                }
            }, { title: window.i18n.t("common.actions.no"), style: "default", inline: true, action: () => { } }]
        );
    }
})