var buildConfig = {};
try {
    const response = await fetch('/android/gradle.local.properties');
    const text = await response.text();

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

class BuildConfigMock {
    CAK() {
        return buildConfig["CAK"] || "0"
    }
}
export default BuildConfigMock;