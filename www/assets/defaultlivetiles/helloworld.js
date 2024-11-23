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
    const tileFeed = new liveTileHelper.TileFeed(liveTileHelper.TileType.NOTIFICATION, liveTileHelper.AnimationType.SLIDE);

    // Add both tiles to create rotation
    tileFeed.addTile(tileFeed.Tile(
        `<p class="show-m show-w" style="margin: 0px; font-size: 60px; font-weight: 100; text-align: center;">Hello</p>`, "red"));
    tileFeed.addTile(tileFeed.Tile(
        `<p class="show-m show-w" style="margin: 0px; font-size: 60px; font-weight: 100; text-align: center;">World</p>`, "blue"
    ));

    return tileFeed;
}

// Replace the minute scheduler with a 10-second rotation using requestGoToNextPage
function scheduleRotation() {
    setInterval(() => {
        liveTileHelper.requestGoToNextPage();
    }, 10000); // 10 seconds
}

// Start the rotation
scheduleRotation();

liveTileHelper.eventListener.on("init", init);
function init(args) {
    console.log("Init called:", args);
    liveTileHelper.requestRedraw();
}
/*setInterval(() => {
    postMessage({
        action: "hi",
        data: { message: "naber" }
    });
}, 1000);*/