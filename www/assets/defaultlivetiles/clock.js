importScripts('./../../dist/liveTileHelper.js');

// Immediately send a test message when the worker starts

liveTileHelper.eventListener.on("draw", draw);
function draw(args) {
    console.log("Draw called:", args);
    return "Hello from clock worker!";
}

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