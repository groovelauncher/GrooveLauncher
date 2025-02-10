/**
 * @name string Clock
 * @provide type people
 * @author string berkaytumal
 * @description string This script displays the current local time in a live tile format.
 * @permission CONTACTS
 * @minVersion number 50
 * @targetVersion number 50
 */

importScripts('./../../dist/liveTileHelper.js');

liveTileHelper.eventListener.on("draw", draw);
var contacts = [];
liveTileHelper.eventListener.on("contactsdata", (data) => {
    //console.log("people data", data)
    contacts = data.contacts;
    liveTileHelper.requestRedraw();

});


function draw(args) {
    const tileFeed = new liveTileHelper.TileFeed({
        type: liveTileHelper.TileType.MATRIX,
        animationType: liveTileHelper.AnimationType.FLIP,
        showAppTitle: true,
        noticationCount: 2
    });
    contacts.filter(e => e["hasAvatar"] == true).forEach(contact => {
        tileFeed.addTile(tileFeed.Tile(`<p class="show-m show-w" style="margin: 0px; font-size: 60px; font-weight: 200; text-align: center;"></p>`, `url('${contact.avatarURL}')`));

    })
    return tileFeed;
}

// Replace the minute scheduler with a 10-second rotation using requestGoToNextPage
function scheduleRotation() {
    setInterval(() => {
        liveTileHelper.requestGoToNextPage();
    }, 10000 + Math.random() * 5000); // 5 to 10 seconds
}

// Start the rotation

liveTileHelper.eventListener.on("init", init);
function init(args) {
    //console.log("Init called:", args);
    //liveTileHelper.requestRedraw();
    //scheduleRotation();

}
/*setInterval(() => {
    postMessage({
        action: "hi",
        data: { message: "naber" }
    });
}, 1000);*/