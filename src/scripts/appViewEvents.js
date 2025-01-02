// Helper function to safely send messages to an iframe
// Throws an error if the iframe or its contentWindow is invalid
const sendMessage = (iframe, action, argument) => {
    if (!iframe?.contentWindow) {
        throw new Error('Invalid iframe element');
    }
    const message = { action, argument };
    iframe.contentWindow.postMessage(message, '*');
};

// Collection of methods for communicating with app iframes
// Object.freeze prevents modifications after creation
const appViewEvents = Object.freeze({
    // Triggers a soft exit (usually back to home screen)
    // homeBack parameter determines the exit behavior
    softExit: (iframe, homeBack) => {
        sendMessage(iframe, 'softExit', homeBack);
    },

    // Updates the app's theme (light/dark mode)
    setTheme: (iframe, theme) => {
        sendMessage(iframe, 'setTheme', theme);
    },

    // Changes the app's accent color
    setAccentColor: (iframe, color) => {
        sendMessage(iframe, 'setAccentColor', color);
    },

    // Updates the app's font family
    setFont: (iframe, font) => {
        sendMessage(iframe, 'setFont', font);
    },
    setAnimationDurationScale: (iframe, scale) => {
        sendMessage(iframe, 'setAnimationDurationScale', scale);
    }

});

export default appViewEvents;