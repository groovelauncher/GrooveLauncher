const appViewEvents = {
    softExit: (iframe, homeBack) => {
        const message = { action: "softExit", argument: homeBack };
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
    setFont: (iframe, font) => {
        const message = { action: "setFont", argument: font };
        iframe.contentWindow.postMessage(message, '*');
    }
}

export default appViewEvents;