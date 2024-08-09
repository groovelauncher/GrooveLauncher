import jQuery from "jquery"
var $ = jQuery
function appTileClick(e) {
    Bridge.requestLaunchApp(e.target.getAttribute("packageName"))
}

const eventReloads = {
    appTile: () => {
        return
        $("div.groove-element.groove-app-tile:not(.groove-letter-tile)").off("flowClick", appTileClick)
        $("div.groove-element.groove-app-tile:not(.groove-letter-tile)").on("flowClick", appTileClick)
    }
}
export default eventReloads;