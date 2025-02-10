/**
 * @name string Photos
 * @provide type photos
 * @author string berkaytumal
 * @description string This script displays photos from gallery.
 * @permission PHOTOS
 * @minVersion number 50
 * @supportedSizes s,m,w
 * @targetVersion number 50
 */

importScripts('./../../dist/liveTileHelper.js');

liveTileHelper.eventListener.on("draw", draw);
var photos = [];
liveTileHelper.eventListener.on("photosdata", (data) => {
    //console.log("photos data!!!!!!!!", data)
    photos = data.photos;
    liveTileHelper.requestRedraw();

});


function draw(args) {
    const tileFeed = new liveTileHelper.TileFeed({
        type: liveTileHelper.TileType.CAROUSEL,
        animationType: liveTileHelper.AnimationType.SLIDE,
        showAppTitle: true,
        noticationCount: 0
    });
    const limitedPhotos = photos.sort(() => 0.5 - Math.random()).slice(0, 10);

    limitedPhotos.forEach(photo => {
        tileFeed.addTile(tileFeed.Tile(`<img src='${photo.photoURL}' style='position:absolute; top: 0; left: 0; width:100%; height:100%; object-fit:cover;' loading='lazy'/>`, ``));

    })
    return tileFeed;
}

// Replace the minute scheduler with a 10-second rotation using requestGoToNextPage
var page = 0
function scheduleRotation() {
    setInterval(() => {
        liveTileHelper.requestGoToNextPage();
        page++;
        if (page == 10) {
            liveTileHelper.requestRedraw()
        }
    }, 10000 + Math.random() * 5000); // 5 to 10 seconds
}

// Start the rotation

liveTileHelper.eventListener.on("init", init);
function init(args) {
    //console.log("Init called:", args);
    //liveTileHelper.requestRedraw();
    scheduleRotation();

}
/*setInterval(() => {
    postMessage({
        action: "hi",
        data: { message: "naber" }
    });
}, 1000);*/