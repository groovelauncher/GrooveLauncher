import jQuery from "jquery";
import GrooveBoard from "./GrooveBoard";
const $ = jQuery
var deletedApps = new Set()
import BuildConfigMock from "./BuildConfigMock";
// Add constants at the top
const CONSTANTS = {
    INTERNAL_SETTINGS_APP: 'groove.internal.settings',
    INTERNAL_TWEAKS_APP: 'groove.internal.tweaks',
    DEFAULT_SYSTEM_INSETS: { left: 0, top: 32, right: 0, bottom: 50 },
    MOCK_ICON_PATH: '/icons/default/',
    MOCK_CONTACT_AVATAR_PATH: '/contacts/',
    EMPTY_SVG: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
};

class GrooveMock {
    mockURL = '';
    #retrievedApps = [];
    constructor(mockURL) {
        this.mockURL = mockURL;
        this.#retrievedApps = [];

        // Use async/await pattern instead of callback
        this.#initializeApps();
    }

    async #initializeApps() {
        try {
            const response = await fetch(this.mockURL);
            const data = await response.json();

            this.#retrievedApps = data.apps
                .filter(app => app.packageName !== 'web.bmdominatezz.gravy')
                .map(app => ({
                    packageName: app.packageName,
                    label: app.label,
                    type: app.type
                }));

            this.#retrievedApps.push({
                packageName: CONSTANTS.INTERNAL_SETTINGS_APP,
                label: 'Groove Settings',
                type: 0
            });
            this.#retrievedApps.push({
                packageName: CONSTANTS.INTERNAL_TWEAKS_APP,
                label: 'Groove Tweaks',
                type: 0
            });
        } catch (error) {
            console.error('Failed to initialize apps:', error);
        }
    }

    getSystemInsets() {
        return JSON.stringify(CONSTANTS.DEFAULT_SYSTEM_INSETS);
    }
    retrieveApps() {
        var retrievedApps = this.#retrievedApps
        return JSON.stringify(retrievedApps.filter(e => !deletedApps.has(e.packageName)))
    }
    getAppLabel() {
        return "App"
    }
    getAppIconURL(packageName = 'undefined') {
        //const baseURL = new URL('./mock/apps.json', window.location.href);
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_ICON_PATH;

        if (packageName == 'instagram.example' || packageName == "com.google.android.googlequicksearchbox") {
            return JSON.stringify({
                foreground: `${iconPath}${packageName}-fg.png`,
                background: `${iconPath}${packageName}-bg.png`
            });
        }

        return JSON.stringify({
            foreground: `${iconPath}${packageName}.png`,
            background: CONSTANTS.EMPTY_SVG
        });
    }
    launchApp(packageName) {
        console.log("Start app:", packageName)
        if (packageName.startsWith("groove.internal")) {
            if (packageName.includes("?")) {
                GrooveBoard.backendMethods.launchInternalApp(packageName.split("?")[0], packageName.split("?")[1]);
            } else {
                GrooveBoard.backendMethods.launchInternalApp(packageName);
            }
        }
        return true
    }
    uninstallApp(packageName) {
        console.log('Uninstall app:', packageName);
        deletedApps.add(packageName);

        // Use Promise instead of setTimeout
        return new Promise(resolve => {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('appUninstall', {
                    detail: { packagename: packageName }
                }));
                console.log('Uninstall event sent!');
                resolve(true);
            }, 2000);
        });
    }
    launchAppInfo(packageName) {
        console.log("Launch app info:", packageName)
        return true
    }
    setStatusBarAppearance(option) {
        console.log("setStatusBarAppearance:", option)
    }
    setNavigationBarAppearance(option) {
        console.log("setNavigationBarAppearance:", option)
    }
    searchStore(appName) {
        console.log("searchStore:", appName)
    }
    setUIScale(scale) {
        console.log("setUIScale:", scale * 100 + "%")
    }
    openURL(url) {
        window.open(url, "_blank")
    }
    getAppVersion() {
        return "0.5.4-beta.5"
    }
    getWebViewVersion() {
        const versionName = "chrome"
        const versionCode = "chrome"
        return versionName + " (code: " + versionCode + ")";

    }
    isDeviceRooted() { return false }
    isShizukuAvailable() { return true }
    getDefaultApps() {
        return JSON.stringify({
            "phoneApp": "com.google.android.dialer",
            "messageApp": "com.google.android.apps.messaging",
            "browserApp": "com.android.chrome",
            "mailApp": "com.google.android.gm",
            "storeApp": "com.android.vending",
            "contactsApp": "com.google.android.contacts",
            "musicApp": "com.google.android.apps.youtube.music",
            "galleryApp": "com.google.android.apps.photos"
        })
    }
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log("Copied to clipboard:", text);
            return true;
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            return false;
        }
    }
    getDisplayOrientation() {
        if (window.innerWidth > window.innerHeight) {
            return "landscape"
        } else {
            return "portrait"
        }
    }
    setDisplayOrientationLock(orientation) {
        console.log("setDisplayOrientationLock:", orientation)
    }
    getContacts() {
        return JSON.stringify([
            { name: "Contact 1", id: "1", hasAvatar: true },
            { name: "Contact 2", id: "2", hasAvatar: true },
            { name: "Contact 3", id: "3", hasAvatar: true },
            { name: "Contact 4", id: "4", hasAvatar: true },
            { name: "Contact 5", id: "5", hasAvatar: true },
            { name: "Contact 6", id: "6", hasAvatar: true },
            { name: "Contact 7", id: "7", hasAvatar: true },
            { name: "Contact 8", id: "8", hasAvatar: true },
            { name: "Contact 9", id: "9", hasAvatar: true },
            { name: "Contact 10", id: "10", hasAvatar: true }
        ])
    }
    getPhotos() {
        return JSON.stringify([
            { id: "1", uri: "1" },
            { id: "2", uri: "2" },
            { id: "3", uri: "3" },
            { id: "4", uri: "4" },
            { id: "5", uri: "5" },
            { id: "6", uri: "6" },
            { id: "7", uri: "7" },
            { id: "8", uri: "8" },
            { id: "9", uri: "9" },
            { id: "10", uri: "10" }
        ])
    }
    getContactAvatarURL(id) {
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_CONTACT_AVATAR_PATH;
        return `${iconPath}${id}.jpeg`;
    }
    getPhotoURL(id) {
        const baseURL = new URL('./mock/apps.json', window.location.href);
        const iconPath = baseURL.href.split('/').slice(0, -1).join('/') + CONSTANTS.MOCK_CONTACT_AVATAR_PATH;
        return `${iconPath}${id}.jpeg`;
    }
    appReady() {
        console.log("App ready")
    }
    setAccentColor(color) {
        console.log("Set accent color:", color)
    }
    /*setAppIconColor(color) {
        console.log("Set app icon color:", color)
    }*/
    getSystemLocale() {
        return "en-US"
    }
    getAnimationDurationScale() {
        return 1;
    }
    triggerHapticFeedback(haptic) {
        if (haptic != "SUPPORTED" && haptic != "NO_HAPTICS") {
            if (haptic == "CLOCK_TICK") {
                playHapticTick(.25);
            } else {
                playHapticTick();
            }
        }
        return "true"
    }
    getSystemAccentColor(arg) {
        if (arg == "supported") {
            return true.toString()
        } else if (arg == "provider") {
            return "Groove Mock"
        } else {
            //Default violet
            return "#AA00FF"
        }
    }
}// Create a reusable AudioContext
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to play haptic-like tick sound
function playHapticTick(volume = 1) {
    // Clamp volume between 0 and 1
    volume = Math.max(0, Math.min(1, volume));

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(240, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.75 * volume, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001 * volume,
        audioCtx.currentTime + 0.025
    );

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.025);
}

window.mockDeepLink = (url) => {
    const event = new CustomEvent("deepLink", {
        detail: {
            url: url
        }
    })
    window.dispatchEvent(event)
}
window.mockDeepLinkExample = () => {
    window.mockDeepLink("groove:?installStyle=data:@file/css;base64,LyogdGl0bGU6IE15IHN1cGVyIGNyYXp5IEdyb292ZSBMYXVuY2hlciBzdHlsZSAqLwovKiBhdXRob3I6IFtCZXJrYXkgVHVtYWxdKGh0dHBzOi8vZ2l0aHViLmNvbS9iZXJrYXl0dW1hbCkgKi8KLyogaWNvbjogZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNFFES1JYaHBaZ0FBVFUwQUtnQUFBQWdBQmdFU0FBTUFBQUFCQUFFQUFBRWFBQVVBQUFBQkFBQUFWZ0ViQUFVQUFBQUJBQUFBWGdFb0FBTUFBQUFCQUFJQUFBSVRBQU1BQUFBQkFBRUFBSWRwQUFRQUFBQUJBQUFBWmdBQUFBQUFBQUJJQUFBQUFRQUFBRWdBQUFBQkFBZVFBQUFIQUFBQUJEQXlNakdSQVFBSEFBQUFCQUVDQXdDZ0FBQUhBQUFBQkRBeE1EQ2dBUUFEQUFBQUFRQUJBQUNnQWdBRUFBQUFBUUFBQUJTZ0F3QUVBQUFBQVFBQUFCU2tCZ0FEQUFBQUFRQUFBQUFBQUFBQUFBRC8yd0NFQUFFQkFRRUJBUUlCQVFJREFnSUNBd1FEQXdNREJBVUVCQVFFQkFVR0JRVUZCUVVGQmdZR0JnWUdCZ1lIQndjSEJ3Y0lDQWdJQ0FrSkNRa0pDUWtKQ1FrQkFRRUJBZ0lDQkFJQ0JBa0dCUVlKQ1FrSkNRa0pDUWtKQ1FrSkNRa0pDUWtKQ1FrSkNRa0pDUWtKQ1FrSkNRa0pDUWtKQ1FrSkNRa0pDUWtKQ1FrSkNmL2RBQVFBQXYvQUFCRUlBQlFBRkFNQklnQUNFUUVERVFIL3hBR2lBQUFCQlFFQkFRRUJBUUFBQUFBQUFBQUFBUUlEQkFVR0J3Z0pDZ3NRQUFJQkF3TUNCQU1GQlFRRUFBQUJmUUVDQXdBRUVRVVNJVEZCQmhOUllRY2ljUlF5Z1pHaENDTkNzY0VWVXRId0pETmljb0lKQ2hZWEdCa2FKU1luS0NrcU5EVTJOemc1T2tORVJVWkhTRWxLVTFSVlZsZFlXVnBqWkdWbVoyaHBhbk4wZFhaM2VIbDZnNFNGaG9lSWlZcVNrNVNWbHBlWW1acWlvNlNscHFlb3FhcXlzN1MxdHJlNHVickN3OFRGeHNmSXljclMwOVRWMXRmWTJkcmg0dVBrNWVibjZPbnE4Zkx6OVBYMjkvajUrZ0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MRVFBQ0FRSUVCQU1FQndVRUJBQUJBbmNBQVFJREVRUUZJVEVHRWtGUkIyRnhFeUl5Z1FnVVFwR2hzY0VKSXpOUzhCVmljdEVLRmlRMDRTWHhGeGdaR2lZbktDa3FOVFkzT0RrNlEwUkZSa2RJU1VwVFZGVldWMWhaV21Oa1pXWm5hR2xxYzNSMWRuZDRlWHFDZzRTRmhvZUlpWXFTazVTVmxwZVltWnFpbzZTbHBxZW9xYXF5czdTMXRyZTR1YnJDdzhURnhzZkl5Y3JTMDlUVjF0ZlkyZHJpNCtUbDV1Zm82ZXJ5OC9UMTl2ZjQrZnIvMmdBTUF3RUFBaEVERVFBL0FQN0pmMmcvMnFWK0UvaWkzK0gvQUlkc1B0K3NTV011cFR5U01VdExXMWl5RmVRb0M3dEl5N1ZqUVo0TGRBTStPZkRYOXNENHlYcnZKOFVQQ1IwcEZHOCtYTXNxN1IxQ092Zkh6S0N2STRPRHhYbW43Yi9nL1ZOSytKRnY0MjAvVnRjMGFMVXhZMmR5TklXeWNYY1VVcmZ1NTJ2RWJ5NHp2OHRuaktzaXZuSXdDdnhKOFhQaFg0eitIOS9iNkl2aWpWdEp1dFMxVzAxQ1hSdnQ4dW9POXZEdEpFazBza25seE9FUlJGQXFJMGhLa3ZrMS9uLzRyZUpmR1ZITjhkaWNCVTlsUXdyMmE5Mnl0YStxNW5VdjdzWXFUMlNTMVorNzhHOEk1WGlxTkNqVmplVlZiNjZkOXIyNWJIOUlQaC9WN1BYTkhnMW13bEUxdmRJSkluWGtNakRJTmJPNWE4ZCtBT2phcm9Id2M4UGFWckEyM2Nkb2htVWpHMTMrWWpIYkdjVjdCODlmM053MWo2dUt5M0Q0ckVRNVp6aEZ0ZG00cHRmTFkvRmN4dzhhV0luU2c3cE5wZkkvLzlEKzdqeHQ0RzhMK09OUGZTZkZWb2w1YXlsVmFLUVpYQjQ0OURqMHJ6WHdwK3pGOEMvQm1zUmE3NGU4UFc4VjVFVjh1VnQwakpqcHQzbHNZN2VsZThYZmIvZlQrZE9IM2g5UlhqWS9oakxjVk9PSXhPSGhLY2RVM0ZOcHJacHRhVzZXT3VobVdJb3g5blNxT0tlalNkcnJ0NkZtM2lFS2JRU2M4ODFQVFUrN1RxOVpSVmprY1VmLzJRPT0gKi8KLyogZGVzY3JpcHRpb246IEp1c3QgYSBzdXBlciBjcmF6eSBzdHlsZSB0byB0ZXN0IEdyb292ZSBUd2Vha3MgKi8KKiB7CiAgICBmaWx0ZXI6IGludmVydCgxMDAlKSBibHVyKDVweCk7Cn0KCmJvZHkgewogICAgYmFja2dyb3VuZDogcmVkOwogICAgYW5pbWF0aW9uOiBjb29sLWFuaW1hdGlvbiA1cyBpbmZpbml0ZTsKCn0KCkBrZXlmcmFtZXMgY29vbC1hbmltYXRpb24gewogICAgZnJvbSB7CiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7CiAgICB9CgogICAgdG8gewogICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7CiAgICB9Cn0=")
}
export default GrooveMock;
export { BuildConfigMock, GrooveMock }