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
    const tileFeed = new liveTileHelper.TileFeed(liveTileHelper.TileType.STATIC, liveTileHelper.AnimationType.FLIP);

    const result = getLocalTime();
    console.log(result);
    tileFeed.addTile(tileFeed.Tile(
        `<p class="show-m" style="margin: 0px; font-size: 60px; font-weight: 100; text-align: left; width: min-content; position: absolute; left: 12px;">${result[0]} <span style="font-size: 0.5em;position: relative; top: -20px;">${result[1]}</span></p>
        <p class="show-w" style="margin: 0px; font-size: 100px; font-weight: 100; text-align: center; width: max-content;">${result[0]}<span style="font-size: 0.5em;">${result[1]}</span></p>
        `
    ))
    return tileFeed;
}
// Set up minute change detector
function scheduleNextMinuteUpdate() {
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
        liveTileHelper.requestRedraw();
        scheduleNextMinuteUpdate(); // Schedule next update
    }, msUntilNextMinute);
}

// Start the scheduling
scheduleNextMinuteUpdate();

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