
import "https://code.jquery.com/jquery-3.7.1.js";
import "https://code.jquery.com/ui/1.14.1/jquery-ui.js";
import flowTileLib from "./flowTile.js";
$("#container").resizable();
$("#container").on("resize",(e,ui)=>{
    fl.calculateCycle()

})
window.flowTile = flowTileLib.flowTile
window.fl = flowTileLib.flowTile(document.querySelector("#container"))
const sizes = {
    s: [1, 1],
    m: [2, 2],
    w: [4, 2],
    l: [4, 4]
}
var properties = {
    containerPadding: 10,
    tileMargin: 10
}

document.querySelector("#settings > div:nth-child(1) > button:nth-child(1)").addEventListener("click", () => {
    const tile = flowTileLib.tile(undefined, undefined, 4, 2)
    fl.addTile(tile)
})
document.querySelector("#settings > div:nth-child(1) > button:nth-child(3)").addEventListener("click", () => {
    fl.addTile(flowTileLib.tile(0, 0, 4, 2))
    fl.addTile(flowTileLib.tile(0, 2, 1, 1))
    fl.addTile(flowTileLib.tile(1, 2, 1, 1))
    fl.addTile(flowTileLib.tile(0, 3, 1, 1))
    fl.addTile(flowTileLib.tile(1, 3, 1, 1))
    fl.addTile(flowTileLib.tile(2, 2, 2, 2))
})
document.querySelector("#settings > div:nth-child(3) > button:nth-child(2)").addEventListener("click", () => {
    fl.calculateCycle()
})
