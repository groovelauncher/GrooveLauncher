import DOMPurify from 'dompurify';
import { TileType, AnimationType } from "./liveTileHelper.js";
const ALLOWED_TAGS = [
    'div', 'span', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'ul', 'ol', 'li', 'button', 'i', 'b', 'u', 'em', 'strong',
    'br', 'figure', 'figcaption', 'svg', 'video', 'audio'
];
const ALLOWED_ATTR = [
    'href', 'src', 'alt', 'style', 'class', 'id', 'title', 'target',
    'data-*', 'aria-*', 'controls', 'autoplay', 'loop'
];
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
        case 'requestGoToPage':
            controller.goToPage(message.data);
            break;
        case 'requestGoToNextPage':
            controller.goToNextPage();
            break;
        case 'requestGoToPreviousPage':
            controller.goToPreviousPage();
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
        this.tileType = TileType.STATIC;
        this.animationType = AnimationType.SLIDE;
        this.worker = worker || window.liveTiles[packageName]["worker"];
        this.lastDrawTime = 0;
    }
    getDOMTile() {
        let tile = document.querySelector(`div.groove-home-tile.live-tile[packagename="${this.packageName}"]`);
        if (!tile) {
            initializeLiveTiles();
            tile = document.querySelector(`div.groove-home-tile.live-tile[packagename="${this.packageName}"]`);
            if (!tile) throw new Error(`Tile for package ${this.packageName} not found`);
        }
        return tile;
    }

    async draw() {
        try {
            const response = await this.sendMessageToWorker({
                action: "draw",
                data: { message: "Drawing from tile controller" },
            });
            console.log("Drawing from tile controller", response);

            if (!response.result) {
                throw new Error('Invalid response format: missing result');
            }

            const tile = this.getDOMTile();
            const liveTileContainer = tile.querySelector('div.live-tile-container');
            const result = response.result;
            this.tileType = result.type;
            this.animationType = result.animationType;
            // Update tile attributes and classes
            liveTileContainer.setAttribute("max-page",
                result.type == TileType.STATIC ? 1 :
                    result.type == TileType.CAROUSEL ? result.tiles.length :
                        result.tiles.length + 1
            );
            liveTileContainer.style.setProperty('--animation-duration', Math.ceil(result.duration) + "ms");
            liveTileContainer.classList.remove('tile-type-static', 'tile-type-carousel', 'tile-type-notification');
            liveTileContainer.classList.add(`tile-type-${result.type}`);
            tile.classList.remove('tile-type-static', 'tile-type-carousel', 'tile-type-notification');
            tile.classList.add(`tile-type-${result.type}`);
            liveTileContainer.setAttribute("current-page", Number(liveTileContainer.getAttribute("current-page")) || 0);
            liveTileContainer.setAttribute("show-app-title", result.showAppTitle ? "true" : "false");
            tile.classList.remove("hide-app-title");
            if (!result.showAppTitle) tile.classList.add("hide-app-title");

            // Build and sanitize content
            const content = result.tiles.map((tile, index) => {
                return `<div class="live-tile-page" style="--page-index: ${index}">${tile.background ?
                    `<div style="background: ${tile.background}" class="live-tile-background${tile.contentHTML ? ' bg-shade' : ''}"></div>` : ''
                    }${tile.contentHTML}</div > `;
            }).join('');

            const sanitized = DOMPurify.sanitize(content, {
                ALLOWED_TAGS,
                ALLOWED_ATTR
            });
            liveTileContainer.innerHTML = sanitized;
            // Set first page visible for carousel type
            if (result.type === TileType.CAROUSEL) {
                const firstPage = liveTileContainer.querySelector('.live-tile-page');
                if (firstPage) {
                    firstPage.style.visibility = 'visible';
                }
            }
            return response;
        } catch (error) {
            console.error('Error in draw():', error);
            throw error;
        }
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
    _goToPage_slide(page, direction) {
        const tile = this.getDOMTile();
        const liveTileContainer = tile.querySelector('div.live-tile-container');
        const maxPage = parseInt(liveTileContainer.getAttribute("max-page")) || 1;
        const currentPage = parseInt(liveTileContainer.getAttribute("current-page")) || 0;
        const nextPage = Math.min(Math.max(0, page), maxPage - 1);
        // Calculate direction considering circular navigation
        if (currentPage === nextPage) {
            return false;
        } else if (
            (nextPage > currentPage && nextPage - currentPage <= maxPage / 2) ||
            (nextPage < currentPage && currentPage - nextPage > maxPage / 2)
        ) {
            direction = direction == undefined ? 1 : direction; // Forward
        } else {
            direction = direction == undefined ? 0 : direction; // Backward
        }
        liveTileContainer.classList.remove('direction-forward', 'direction-backward');
        liveTileContainer.classList.add(`direction-${direction}`);
        liveTileContainer.setAttribute("current-page", nextPage);
        liveTileContainer.style.setProperty('--current-page', nextPage);

        // Update direction classes for all pages
        const pages = liveTileContainer.querySelectorAll('.live-tile-page');
        pages.forEach((page, index) => {
            page.classList.remove('show-direction-0', 'show-direction-1', 'hide-direction-0', 'hide-direction-1');
            page.querySelector('div.live-tile-background').classList.remove('show-direction-0', 'show-direction-1', 'hide-direction-0', 'hide-direction-1');
            const pageIndex = this.tileType === TileType.NOTIFICATION ? index + 1 : index;
            if (pageIndex === nextPage || pageIndex === currentPage) {
                page.style.visibility = "visible"
                page.classList.add(`${pageIndex === nextPage ? 'show' : 'hide'}-direction-${direction}`);
                if (!(nextPage == 0 || currentPage == 0)) page.querySelector('div.live-tile-background').classList.add(`${pageIndex === nextPage ? 'show' : 'hide'}-direction-${1 - direction}`);
            } else {
                page.style.visibility = "hidden"
            }
        });

        const iconElement = tile.querySelector('img.groove-home-tile-imageicon');
        iconElement.classList.add('hide-dsfgasdirection-0');
        console.log("iconElement", this.tileType)
        iconElement.classList.remove('hide-direction-0', 'hide-direction-1', 'show-direction-0', 'show-direction-1');
        // Handle notification tile icon visibility
        if (this.tileType == TileType.NOTIFICATION && iconElement) {
            if (nextPage == 0 || currentPage == 0) {
                iconElement.style.visibility = 'visible';
                if (nextPage == 0) {
                    iconElement.classList.add(`show-direction-${direction}`);
                } else {
                    iconElement.classList.add(`hide-direction-${direction}`);
                }
            } else {
                iconElement.style.visibility = 'hidden';
            }
        }

        console.log("icon direction", direction)
        return true;
    }
    _goToPage_flip(page, direction) {
        const tile = this.getDOMTile();
        const liveTileContainer = tile.querySelector('div.live-tile-container');
        const maxPage = parseInt(liveTileContainer.getAttribute("max-page")) || 1;
        const currentPage = parseInt(liveTileContainer.getAttribute("current-page")) || 0;
        const nextPage = Math.min(Math.max(0, page), maxPage - 1);

    }
    goToPage(page, direction) {
        if (this.animationType === AnimationType.SLIDE) {
            return this._goToPage_slide(page, direction);
        } else {
            return this._goToPage_flip(page, direction);
        }
    }
    goToNextPage() {
        const tile = this.getDOMTile();
        const liveTileContainer = tile.querySelector('div.live-tile-container');
        const maxPage = parseInt(liveTileContainer.getAttribute("max-page")) || 1;
        const currentPage = parseInt(liveTileContainer.getAttribute("current-page")) || 0;
        const nextPage = (currentPage + 1) % maxPage;
        return this.goToPage(nextPage);
    }
    goToPreviousPage() {
        const tile = this.getDOMTile();
        const liveTileContainer = tile.querySelector('div.live-tile-container');
        const maxPage = parseInt(liveTileContainer.getAttribute("max-page")) || 1;
        const currentPage = parseInt(liveTileContainer.getAttribute("current-page")) || 0;
        const nextPage = (currentPage - 1 + maxPage) % maxPage;
        return this.goToPage(nextPage);
    }
}
function initializeLiveTiles() {
    const tiles = document.querySelectorAll('div.groove-home-tile:not(.live-tile)');
    tiles.forEach(tile => {
        const packageName = tile.getAttribute('packagename');
        if (packageName && window.liveTiles[packageName]) {
            const innerTile = tile.querySelector('div.groove-home-inner-tile');
            if (innerTile && !innerTile.querySelector('div.live-tile-container')) {
                const liveTileContainer = document.createElement('div');
                liveTileContainer.className = 'live-tile-container';
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