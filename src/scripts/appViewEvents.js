const appViewEvents = {
    softExit: (iframe) => {
        const message = { action: "softExit" };
        iframe.contentWindow.postMessage(message, '*');
    },
    setTheme: (iframe, theme) => {
        const message = { action: "setTheme", argument: theme };
        iframe.contentWindow.postMessage(message, '*');
    },
    setAccentColor: (iframe, color) => {
        const message = { action: "setAccentColor", argument: color };
        iframe.contentWindow.postMessage(message, '*');
    },
}

export default appViewEvents;