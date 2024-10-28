document.querySelector("#uninstallappbutton").addEventListener("flowClick", e => {
    const packageName = window.lastSelectedApp.packageName
    if (parent.GrooveBoard.backendMethods.packageManagerProvider.get() == 0) {
        Groove.uninstallApp(packageName, 0);
        pageNavigation.settingsHome()
    } else {
        parent.GrooveBoard.alert(
            "Uninstall this app?",
            "This app, plus any information it contains, will be deleted from your device.",
            [{
                title: "Yes", style: "default", inline: true, action: () => {
                    Groove.uninstallApp(packageName, parent.GrooveBoard.backendMethods.packageManagerProvider.get());
                    pageNavigation.settingsHome()
                }
            }, { title: "No", style: "default", inline: true, action: () => { } }]
        );
    }
})