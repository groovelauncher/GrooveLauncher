const settingsListTag = document.querySelector("#home-tab > div:nth-child(1) > div > div:nth-child(2) > p.groove-list-view-item-description")
document.querySelector("#rotation-toggle-switch").addEventListener("checked", (e) => {
    document.querySelector("#rotation-lock-tab > div.group.first-group > div > p").innerText = e.target.hasAttribute("checked") ? i18n.t("common.actions.on") : i18n.t("common.actions.off")
    if (e.target.hasAttribute("checked")) {
        const orientation = Groove.getDisplayOrientation()
        localStorage.setItem("rotationLock", orientation)
        Groove.setDisplayOrientationLock(orientation)
        settingsListTag.setAttribute("data-i18n", "common.actions.locked")
    } else {
        localStorage.removeItem("rotationLock")
        Groove.setDisplayOrientationLock("auto")
        settingsListTag.setAttribute("data-i18n", "common.actions.unlocked")
    }
})
if (!!localStorage.getItem("rotationLock")) {
    document.querySelector("#rotation-toggle-switch").setAttribute("checked", "")
    settingsListTag.setAttribute("data-i18n", "common.actions.locked")
}