var buildConfig = {};
if (window["GrooveMockInstance"] || window.parent["GrooveMockInstance"]) {
    try {
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
    signed() {
        return buildConfig["signed"] || false
    }
}
export default BuildConfigMock;