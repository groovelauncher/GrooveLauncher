function requestRedraw(params) {
    console.log("Worker: Sending requestRedraw message");
    postMessage({
        action: "requestRedraw",
        data: params || {}
    });
}
function requestNextTile(params) {
    console.log("Worker: Sending requestNextTile message");
    postMessage({
        action: "requestNextTile",
        data: params || {}
    });
}
onmessage = async function (event) {
    //console.log("Worker received message:", event.data);
    const message = event.data;

    switch (message.action) {
        case 'draw':
            const result = await eventListener.dispatch("draw", message.data);
            postMessage({ id: message.id, status: "success", result: result });

            break;
        case 'init':
            eventListener.dispatch("init", message.data);
            break;
        default:
            console.log("Worker: Unknown action received:", message.action);
    }
};
const eventListener = {
    events: {},  // Store events and their callbacks

    on: (event, callback) => {
        if (!eventListener.events[event]) {
            eventListener.events[event] = [];
        }
        eventListener.events[event].push(callback);
    },

    off: (event, callback) => {
        if (eventListener.events[event]) {
            eventListener.events[event] = eventListener.events[event]
                .filter(cb => cb !== callback);
        }
    },

    dispatch: async (event, data) => {
        if (eventListener.events[event]) {
            try {
                const result = await eventListener.events[event][0](data);
                return result;
            } catch (error) {
                console.error(`Error in dispatch for event '${event}':`, error);
                throw error;
            }
        }
    }
}

// Define the enum for tile types
const TileType = {
    STATIC: "static",
    CAROUSEL: "carousel",
}
Object.freeze(TileType);
// Define the enum for animation types
const AnimationType = {
    FLIP: 'flip',
    SLIDE: 'slide'
}
Object.freeze(AnimationType);

class Tile {
    constructor(id, foregroundSvg, backgroundSvg) {
        this.id = id || Math.random().toString(36).substring(2, 15);
        this.foregroundSvg = foregroundSvg
        this.backgroundSvg = backgroundSvg
    }
}
class TileFeed {
    constructor(type = TileType.PAGES, animationType = AnimationType.FLIP) {
        if (!Object.values(TileType).includes(type)) {
            throw new Error(`Invalid tile type. Must be one of: ${Object.values(TileType).join(', ')}`);
        }
        this.type = type;
        this.animationType = animationType;
        this.tiles = [];
    }
    Tile(foregroundSvg, backgroundSvg) {
        return new Tile(foregroundSvg, backgroundSvg);
    }
    addTile(tile) {
        this.tiles.push(tile);
    }
    getTiles() {
        return this.tiles;
    }
    removeTile(tileOrId) {
        if (typeof tileOrId === 'string') {
            // Remove by ID
            this.tiles = this.tiles.filter(t => t.id !== tileOrId);
        } else {
            // Remove by tile object reference
            this.tiles = this.tiles.filter(t => t !== tileOrId);
        }
    }
}
global.liveTileHelper = {
    requestRedraw, requestNextTile, eventListener, TileFeed, Tile, TileType, AnimationType
}
export default liveTileHelper