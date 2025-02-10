function requestRedraw(params) {
    //console.log("Worker: Sending requestRedraw message");
    postMessage({
        action: "requestRedraw",
        data: params || {}
    });
}
function requestGoToPage(page) {
    //console.log("Worker: Sending requestGoToPage message");
    postMessage({
        action: "requestGoToPage",
        data: page
    });
}
function requestGoToNextPage() {
    // console.log("Worker: Sending requestGoToNextPage message");
    postMessage({
        action: "requestGoToNextPage",
    });
}
function requestGoToPreviousPage() {
    //console.log("Worker: Sending requestGoToPreviousPage message");
    postMessage({
        action: "requestGoToPreviousPage",
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
        case 'contacts-data':
            eventListener.dispatch("contactsdata", message.data);
            break;
        case 'photos-data':
            eventListener.dispatch("photosdata", message.data);
            break;
        case 'notifications-data':
            eventListener.dispatch("notificationsdata", message.data);
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
    NOTIFICATION: "notification",
    MATRIX: "matrix"
}
const TilePresets = {

}
Object.freeze(TileType);
// Define the enum for animation types
const AnimationType = {
    FLIP: 'flip',
    SLIDE: 'slide'
}
Object.freeze(AnimationType);

class Tile {
    constructor(id, contentHTML, background) {
        this.id = id || Math.random().toString(36).substring(2, 15);
        this.contentHTML = contentHTML;
        this.background = background;
    }
}
class TileFeed {
    constructor(options = {}) {
        const defaults = {
            type: TileType.PAGES,
            animationType: AnimationType.FLIP,
            showAppTitle: true,
            duration: 5000 + Math.random() * 500,
            noticationCount: null
        };
        Object.assign(this, defaults, options);

        if (!Object.values(TileType).includes(this.type)) {
            throw new Error(`Invalid tile type. Must be one of: ${Object.values(TileType).join(', ')}`);
        }
        this.tiles = [];
    }
    Tile(contentHTML, background) {
        return new Tile(Math.random().toString(36).substring(2, 15), contentHTML, background);
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
    stringify() {
        return JSON.stringify(this);
    }
}
global.liveTileHelper = {
    requestRedraw, requestGoToPage, requestGoToNextPage, requestGoToPreviousPage, eventListener, TileFeed, Tile, TileType, AnimationType
}
export {
    requestRedraw, requestGoToPage, requestGoToNextPage, requestGoToPreviousPage, eventListener, TileFeed, Tile, TileType, AnimationType
}

export default liveTileHelper