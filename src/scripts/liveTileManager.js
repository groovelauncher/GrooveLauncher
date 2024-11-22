import * as liveTileHelper from "./liveTileHelper.js";
function isOnMainThread() {
    return !!document.querySelector("div.tile-list-inner-container") && window["GrooveRole"] === "main";
}
if (isOnMainThread()) {
    window.liveTiles = window.liveTiles || {};
} else {
    window.parent.liveTiles = window.parent.liveTiles || {};
}
function main_registerLiveTileWorker(packageName, workerScript) {
    if (!packageName || !workerScript) {
        throw new Error('Both packageName and workerScript are required');
    }

    // Stop existing worker if present
    main_unregisterLiveTileWorker(packageName);

    // Create worker from URL or script string
    let worker;
    try {
        if (workerScript.startsWith('http') || workerScript.startsWith('/')) {
            worker = new Worker(workerScript);
        } else {
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            worker = new Worker(blobUrl,);
            URL.revokeObjectURL(blobUrl);
        }

        // Add message and error handlers BEFORE registering the worker
        worker.onmessage = onWorkerMessage

        worker.onerror = function (error) {
            console.log("error", error)
            throw error
        };

        // Register new worker
        window.liveTiles[packageName] = { controller: new tileController(packageName, worker), worker: worker };

        //console.log("Sending init message to worker");
        worker.postMessage({
            action: "init",
            data: { timestamp: Date.now() }
        });

        // Initialize tiles after registering the worker
        initializeLiveTiles();

        return worker;
    } catch (error) {
        console.error("Worker creation error:", error);
        throw new Error(`Failed to create worker: ${error.message}`);
    }
}
function onWorkerMessage(event) {
    const message = event.data;

    if (!message || (!message.action && !message.status)) {
        console.error("Invalid message format:", message);
        return;
    }

    // Find the package name by matching the worker
    const packageEntry = Object.entries(window.liveTiles).find(([_, value]) => value.worker === event.target);
    if (!packageEntry) {
        console.error("Could not find package for worker");
        return;
    }
    const [packageName, { controller }] = packageEntry;

    switch (message.action) {
        case 'requestRedraw':
            setTimeout(() => {
                console.log('Handling requestRedraw');
                const now = Date.now();
                if (now - controller.lastDrawTime >= 20000) { // 20 seconds in milliseconds
                    controller.lastDrawTime = now;
                    controller.draw();
                }
            }, 1000);
            break;
        case 'requestNextTile':
            console.log('Handling requestNextTile with data:', message.data);
            break;
        case 'test':
            console.log('Received test message from worker:', message.data);
            break;
        default:
            console.log('Unknown message action:', message.action);
    }
}
function main_unregisterLiveTileWorker(packageName) {
    if (!packageName) {
        throw new Error('packageName is required');
    }

    if (window.liveTiles && packageName in window.liveTiles) {
        uninitializeLiveTile(packageName);
        const worker = window.liveTiles[packageName].worker;
        if (worker && typeof worker.terminate === 'function') {
            worker.terminate();
        }
        delete window.liveTiles[packageName];
    }
}
const registerLiveTileWorker = function (packageName, workerScript) {
    if (isOnMainThread()) {
        return main_registerLiveTileWorker(packageName, workerScript);
    }
}
const unregisterLiveTileWorker = function (packageName) {
    if (isOnMainThread()) {
        return main_unregisterLiveTileWorker(packageName);
    }
}

function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class tileController {
    constructor(packageName, worker) {
        this.packageName = packageName;
        this.page = 0;
        this.tileType = 0;
        this.worker = worker || window.liveTiles[packageName]["worker"];
        this.lastDrawTime = 0;
    }
    async draw() {
        const response = await this.sendMessageToWorker({
            action: "draw",
            data: { message: "Drawing from tile controller" },
        });
        return response;
        console.log('Worker response:', response);
    }
    sendMessageToWorker(message, timeout = 10000) {
        message.id = generateUniqueId();
        return new Promise((resolve, reject) => {
            const handleMessage = (event) => {
                if (event.data.id === message.id) {
                    clearTimeout(timer);
                    this.worker.removeEventListener('message', handleMessage);
                    resolve(event.data);
                }
            };

            const timer = setTimeout(() => {
                this.worker.removeEventListener('message', handleMessage);
                reject(new Error('Response timed out after 10 seconds'));
            }, timeout);

            this.worker.addEventListener('message', handleMessage);
            this.worker.postMessage(message);
        });
    }
    goToPage() {
        console.log("Going to page for package:", this.packageName);
    }
}
function initializeLiveTiles() {
    const tiles = document.querySelectorAll('div.groove-home-tile:not(.live-tile)');
    tiles.forEach(tile => {
        const packageName = tile.getAttribute('packagename');
        if (packageName && window.liveTiles[packageName]) {
            const innerTile = tile.querySelector('div.groove-home-inner-tile');
            if (innerTile && !innerTile.querySelector('div.liveTileContainer')) {
                const liveTileContainer = document.createElement('div');
                liveTileContainer.className = 'liveTileContainer';
                innerTile.appendChild(liveTileContainer);
            }
            tile.classList.add('live-tile');
            console.log(`Initialized live tile for package: ${packageName}`);
        }
    });
}
function uninitializeLiveTile(packageName) {
    const tiles = document.querySelectorAll(`div.groove-home-tile.live-tile[packagename="${packageName}"]`);
    tiles.forEach(tile => {
        tile.classList.remove('live-tile');
        console.log(`Uninitialized live tile for package: ${packageName}`);
    });
}
export {
    registerLiveTileWorker,
    unregisterLiveTileWorker,
    initializeLiveTiles,
    uninitializeLiveTile
}
const liveTileManager = {
    registerLiveTileWorker,
    unregisterLiveTileWorker,
    initializeLiveTiles,
    uninitializeLiveTile
}
export default liveTileManager