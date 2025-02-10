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
    window.liveTileProviders = window.liveTileProviders || []
} else {
    window.parent.liveTiles = window.parent.liveTiles || {};
    window.parent.liveTileProviders = window.parent.liveTileProviders || []
}

function main_registerLiveTileWorker(packageName, uid) {
    const provider = liveTileProviders.find(provider => provider.id === uid);
    if (!provider) {
        throw new Error('Provider not found');
    }
    if (!provider.metadata.provide.includes(packageName)) {
        console.error('Package not provided by provider');
    }
    const workerScript = provider.script;
    if (!packageName || !workerScript) {
        console.error('Both packageName and workerScript are required');
    }

    // Stop existing worker if present
    main_unregisterLiveTileWorker(packageName);

    // Create worker from URL or script string
    let worker;
    try {
        if (workerScript.startsWith('http') || workerScript.startsWith('/') || workerScript.startsWith('./')) {
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
        window.liveTiles[packageName] = { controller: new tileController(packageName, worker), worker: worker, uid: uid };

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
            break;
        default:
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
const registerLiveTileWorker = function (packageName, uid) {
    if (isOnMainThread()) {
        return main_registerLiveTileWorker(packageName, uid);
    }
}
const unregisterLiveTileWorker = function (packageName) {
    if (isOnMainThread()) {
        return main_unregisterLiveTileWorker(packageName);
    }
}
async function getLiveTileMetadata(workerScript) {
    const response = await fetch(workerScript);
    const content = await response.text();

    const metadataRegex = /\/\*\*\s*([\s\S]*?)\*\//; // Regex to match the metadata block
    const match = content.match(metadataRegex);

    if (match && match[1]) {
        const metadataLines = match[1].trim().split('\n');
        const metadata = {};
        function addProvide(packageName) {
            if (metadata["provide"]) {
                if (metadata["provide"].includes(packageName)) return
                metadata.provide.push(packageName)
            } else {
                metadata["provide"] = [packageName]
            }
        }
        metadataLines.forEach(line => {
            const parts = line.replace(/^\s*\*\s*/, '').split(' ');
            const key = parts[0].replace(/^@/, '');
            const type = parts[1]; // Get the type
            const value = parts.slice(2).join(' '); // Join the remaining parts as the value
            if (key == "provide" && parts.length == 3) {
                switch (type) {
                    case 'type':
                        if (value == "all") {
                            allappsarchive.forEach(e => {
                                addProvide(e)
                            })
                        } else {
                            const typeToPackageNames = (Object.entries(window.iconPackDB).filter(e => e[1].icon == value)).map(e => e[0])
                            typeToPackageNames.forEach(e => {
                                addProvide(e)
                            })
                        }
                        break;
                    case 'packageName':
                        addProvide(value)
                        break;
                }
            } else {
                // Convert value based on type
                switch (type) {
                    case 'number':
                        metadata[key] = Number(value);
                        break;
                    case 'string':
                        metadata[key] = value; // Keep as string
                        break;
                    // Add more cases for other types as needed
                    default:
                        metadata[key] = value; // Default to string
                        break;
                }
            }
        });

        return metadata;
    }

    return null; // Return null if no metadata found
}
async function main_registerLiveTileProvider(workerScript) {
    const uid = generateUniqueId();
    const metadata = await getLiveTileMetadata(workerScript);
    if (!metadata) {
        throw new Error(`Metadata not found for package: ${uid}`);
    }
    liveTileProviders.push({ id: uid, script: workerScript, metadata: Object.assign({ name: "Unknown", author: "Unknown", minVersion: 50, targetVersion: 50, description: "Unknown" }, metadata) });
    return uid;
}
function main_unregisterLiveTileProvider(uid) {
    liveTileProviders = liveTileProviders.filter(provider => provider.id !== uid);
}
function main_getLiveTileProviders(packageName) {
    return liveTileProviders.filter(provider => provider.packageName === packageName) || [];
}
const registerLiveTileProvider = function (workerScript) {
    if (isOnMainThread()) {
        return main_registerLiveTileProvider(workerScript);
    }
}
const unregisterLiveTileProvider = function (uid) {
    if (isOnMainThread()) {
        return main_unregisterLiveTileProvider(uid);
    }
}
const getLiveTileProviders = function (packageName) {
    if (isOnMainThread()) {
        return main_getLiveTileProviders(packageName);
    }
}
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function generateRandomAccent() {
    /*const accentColor = GrooveBoard.backendMethods.serveConfig().accentcolor;
    return adjustColor(accentColor, Math.floor(Math.random() * 100) - 50);*/
    return "var(--accent-color-shade-" + Math.floor(Math.random() * 4) + ")";
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
                        result.type == TileType.MATRIX ? result.tiles.length :
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
            if (result.type == TileType.MATRIX) {
                liveTileContainer.innerHTML = `<div class="live-tile-matrix-source">${sanitized}</div>
                <div class="live-tile-matrix show-m"><div class="live-tile-matrix-container">${`<div class='live-tile-matrix-column'>${"<div class='live-tile-matrix-row'></div>".repeat(3)}</div>`.repeat(3)
                    }</div></div>
                <div class="live-tile-matrix show-w"><div class="live-tile-matrix-container">${`<div class='live-tile-matrix-column'>${"<div class='live-tile-matrix-row'></div>".repeat(6)}</div>`.repeat(3)
                    }</div></div>`;
                const sizes = [liveTileContainer.querySelector("div.live-tile-matrix.show-m"), liveTileContainer.querySelector("div.live-tile-matrix.show-w")];
                const dataTiles = liveTileContainer.querySelector("div.live-tile-matrix-source").querySelectorAll("div.live-tile-page");

                liveTileContainer.querySelectorAll("div.live-tile-matrix-row").forEach(matrixTile => {
                    sizes.forEach(size => {
                        const allMatrixTiles = size.querySelectorAll("div.live-tile-matrix-row")
                        /*if (dataTiles.length < allMatrixTiles.length) {
                            allMatrixTiles.forEach((tile, index) => {
                                const randomTile = dataTiles[Math.floor(Math.random() * dataTiles.length)]
                                tile.innerHTML = randomTile.innerHTML;
                            })
                        } else {
                            var unplacedTiles = dataTiles;
                            allMatrixTiles.forEach((tile, index) => {
                                const randomUnplacedTile = unplacedTiles[Math.floor(Math.random() * unplacedTiles.length)]
                                tile.innerHTML = randomUnplacedTile.innerHTML;
                                unplacedTiles = unplacedTiles.filter(tile => tile !== randomUnplacedTile);
                            })
                        }*/
                    });
                    matrixTile.style.backgroundColor = generateRandomAccent();
                });

                function drawNextFlip() {
                    sizes.forEach((size) => {
                        const allMatrixTiles = size.querySelectorAll("div.live-tile-matrix-row")
                        const randomTile = allMatrixTiles[Math.floor(Math.random() * allMatrixTiles.length)]
                        if (!randomTile["flipping"]) {
                            randomTile["flipping"] = true
                            randomTile.classList.add("flip")
                            setTimeout(() => {
                                size["usedMatrixTiles"] = size["usedMatrixTiles"] || []
                                const unusedTiles = Array.from(dataTiles).filter(tile => !size["usedMatrixTiles"].includes(tile));
                                randomTile.style.backgroundColor = generateRandomAccent();

                                if (Math.random() < .05 || unusedTiles.length == 0) {
                                    //delete
                                    randomTile.innerHTML = "";
                                    if (randomTile["usingTile"]) {
                                        setTimeout(() => {
                                            size["usedMatrixTiles"] = size["usedMatrixTiles"].filter(tile => tile !== randomTile["usingTile"]);
                                            delete randomTile["usingTile"]
                                        }, 1800);
                                    }
                                } else {
                                    const randomDataTile = unusedTiles.length > 0 ?
                                        unusedTiles[Math.floor(Math.random() * unusedTiles.length)] :
                                        dataTiles[Math.floor(Math.random() * dataTiles.length)];
                                    size["usedMatrixTiles"].push(randomDataTile)
                                    randomTile["usingTile"] = randomDataTile;
                                    randomTile.innerHTML = randomDataTile.innerHTML;
                                }



                            }, 200);
                            setTimeout(() => {
                                delete randomTile["flipping"]
                                randomTile.classList.remove("flip")
                            }, 2000);
                        }
                    })
                    const duration = Math.random() * 2900 + 100
                    setTimeout(() => {
                        drawNextFlip()
                    }, duration);
                }
                drawNextFlip();

            } else {
                liveTileContainer.innerHTML = sanitized;
            }

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
            const liveTileBackground = page.querySelector('div.live-tile-background')
            if (liveTileBackground) liveTileBackground.classList.remove('show-direction-0', 'show-direction-1', 'hide-direction-0', 'hide-direction-1');
            const pageIndex = this.tileType === TileType.NOTIFICATION ? index + 1 : index;
            if (pageIndex === nextPage || pageIndex === currentPage) {
                page.style.visibility = "visible"
                page.classList.add(`${pageIndex === nextPage ? 'show' : 'hide'}-direction-${direction}`);
                if (liveTileBackground) if (!(nextPage == 0 || currentPage == 0)) page.querySelector('div.live-tile-background').classList.add(`${pageIndex === nextPage ? 'show' : 'hide'}-direction-${1 - direction}`);
            } else {
                page.style.visibility = "hidden"
            }
        });

        const iconElement = tile.querySelector('img.groove-home-tile-imageicon');
        iconElement.classList.add('hide-dsfgasdirection-0');
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

        return true;
    }
    _goToPage_flip(page, direction) {
        const tile = this.getDOMTile();
        const liveTileContainer = tile.querySelector('div.live-tile-container');
        const maxPage = parseInt(liveTileContainer.getAttribute("max-page")) || 1;
        const currentPage = parseInt(liveTileContainer.getAttribute("current-page")) || 0;
        const nextPage = Math.min(Math.max(0, page), maxPage - 1);
    }
    _goToPage_matrix(page, direction) {

    }



    ///ESKİ
    /*
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
        */
    //ESKİ




    goToPage(page, direction) {
        if (this.animationType === AnimationType.SLIDE) {
            return this._goToPage_slide(page, direction);
        } else if (this.animationType === AnimationType.FLIP) {
            return this._goToPage_flip(page, direction);
        } else if (this.animationType === AnimationType.MATRIX) {
            return this._goToPage_matrix(page, direction);
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
        }
    });
}
function uninitializeLiveTile(packageName) {
    const tiles = document.querySelectorAll(`div.groove-home-tile.live-tile[packagename="${packageName}"]`);
    tiles.forEach(tile => {
        tile.classList.remove('live-tile');
    });
}
export {
    registerLiveTileProvider,
    unregisterLiveTileProvider,
    getLiveTileProviders,
    registerLiveTileWorker,
    unregisterLiveTileWorker,
    initializeLiveTiles,
    uninitializeLiveTile
}
const liveTileManager = {
    registerLiveTileProvider,
    unregisterLiveTileProvider,
    getLiveTileProviders,
    registerLiveTileWorker,
    unregisterLiveTileWorker,
    initializeLiveTiles,
    uninitializeLiveTile
}
export default liveTileManager