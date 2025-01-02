var buildConfig = {};
console.log("window", window["GrooveMockInstance"], window.parent["GrooveMockInstance"], window.GrooveMockInstance)
if (window["GrooveMockInstance"] || window.parent["GrooveMockInstance"]) {
    console.log("build")

    try {
        const response = await fetch(window.location.origin + '/android/gradle.local.properties');
        const text = await response.text();
        console.log("text", text)
        // Convert properties to JSON by splitting lines and parsing key=value pairs
        const json = text.split('\n').reduce((acc, line) => {
            const [key, value] = line.trim().split('=');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});
        buildConfig = json
    } catch (error) {
        console.error('Failed to load properties:', error);
    }
}
class BuildConfigMock {
    CAK() {
        return buildConfig["CAK"] || "0"
    }
}
export default BuildConfigMock;