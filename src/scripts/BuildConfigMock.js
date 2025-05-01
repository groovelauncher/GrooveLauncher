var buildConfig = {};
if (window["GrooveMockInstance"] || window.parent["GrooveMockInstance"]) {
    try {
        if (!(location.hostname == "localhost" || location.hostname == "127.0.0.1")) throw new Error()
        const response = await fetch(window.location.origin + '/android/gradle.local.properties');
        const text = await response.text();
        // Convert properties to JSON by splitting lines and parsing key=value pairs
        const json = text.split('\n').reduce((acc, line) => {
            const [key, value] = line.trim().split('=');
            if (key && value) {
                acc[key] = value;
            }
            acc.signed = true;
            return acc;
        }, {});
        buildConfig = json
    } catch (error) {
        buildConfig = {
            signed: false
        }
        console.warn("RUNNING IN UNSIGNED TEST MODE")
    }
}
class BuildConfigMock {
    CAK() {
        return buildConfig["CAK"] || "0"
    }
    CHANGELOG() {
        return "<strong>Hello</strong>Hello{NEWLINE}World"
    }
    signed() {
        return buildConfig["signed"] || false
    }
    isGeckoView() {
        // For web mock, detect via query param or default to false
        return window.location.search.includes('engine=geckoview') || false;
    }
    isWebView() {
        // For web mock, detect via query param or default to true
        return !this.isGeckoView();
    }
    isNightly() {
        // For web mock, detect via query param or default to true
        return window.location.search.includes('nightly=true') || true;
    }
    getAppVersion() {
        // Try to get from buildConfig or fallback
        return buildConfig["VERSION_NAME"] || "web-nightly";
    }
    getAppArchitecture() {
        // For web mock, detect via query param or fallback
        const match = window.location.search.match(/arch=([\w-]+)/);
        return match ? match[1] : "x86_64";
    }
}
export default BuildConfigMock;