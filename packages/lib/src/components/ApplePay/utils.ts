export function resolveSupportedVersion(latestVersion) {
    const versions = [];
    for (let i = latestVersion; i > 0; i--) {
        versions.push(i);
    }

    return versions.find(v => v && window.ApplePaySession && ApplePaySession.supportsVersion(v));
}
