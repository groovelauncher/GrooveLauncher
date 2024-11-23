importScripts('./../../dist/liveTileHelper.js');

// Immediately send a test message when the worker starts
function getLocalTime() {
    const now = new Date();
    const formattedTime = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric',
    }).format(now);

    const parts = formattedTime.split(" ");
    return parts.length === 2 ? [parts[0], parts[1]] : [parts[0]];
}


liveTileHelper.eventListener.on("draw", draw);
function draw(args) {
    const tileFeed = new liveTileHelper.TileFeed({
        type: liveTileHelper.TileType.NOTIFICATION,
        animationType: liveTileHelper.AnimationType.SLIDE,
        noticationCount: 2
    });
    // Add both tiles to create rotation
    tileFeed.addTile(tileFeed.Tile(
        `<p class="show-m show-w" style="margin: 0px; font-size: 60px; font-weight: 200; text-align: center;">Hello</p>`, `url(https://picsum.photos/200?${Math.random() * 100})`));
    tileFeed.addTile(tileFeed.Tile(
        `<p class="show-m show-w" style="margin: 0px; font-size: 60px; font-weight: 200; text-align: center;">World</p>`, `url(https://picsum.photos/200?${Math.random() * 100})`
    ));

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
    console.log("Init called:", args);
    liveTileHelper.requestRedraw();
    scheduleRotation();

}
/*setInterval(() => {
    postMessage({
        action: "hi",
        data: { message: "naber" }
    });
}, 1000);*/