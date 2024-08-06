import jQuery from "jquery"
var $ = jQuery
function appTileClick(e) {
    Bridge.requestLaunchApp(e.target.getAttribute("packageName"))
}
const eventReloads = {
    appTile: () => {
        $("div.groove-element.groove-app-tile:not(.groove-letter-tile)").off("click", appTileClick)
        $("div.groove-element.groove-app-tile:not(.groove-letter-tile)").on("click", appTileClick)
    }
}
export default eventReloads;