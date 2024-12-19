export function compareVersions(version1, version2) {
    const parseVersion = (version) => {
        const [main, preRelease] = version.split('-');
        const [major, minor, patch] = main.split('.').map(Number);
        const preReleaseVersion = preRelease ? parseInt(preRelease.split('.').pop()) : null;
        return { major, minor, patch, preReleaseVersion, preRelease };
    };

    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);

    // Compare the major, minor, and patch numbers
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    if (v1.patch !== v2.patch) return v1.patch - v2.patch;

    // If both are stable versions or both are pre-release versions, we check pre-release versions
    if (!v1.preRelease && v2.preRelease) return 1; // Stable is always newer than beta
    if (v1.preRelease && !v2.preRelease) return -1; // Beta is always older than stable
    if (v1.preRelease && v2.preRelease) {
        return v1.preReleaseVersion - v2.preReleaseVersion; // Compare beta versions
    }

    return 0; // If they are equal
}

export function olderThan(version1) {
    const currentVersion = Groove.getAppVersion();
    return compareVersions(currentVersion, version1) < 0;
}

export function newerThan(version1) {
    const currentVersion = Groove.getAppVersion();
    return compareVersions(currentVersion, version1) > 0;
}