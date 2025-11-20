export function resolveSupportedVersion(latestVersion: number): number | null {
    try {
        for (let v = latestVersion; v > 0; v--) {
            if (typeof ApplePaySession?.supportsVersion === 'function' && ApplePaySession.supportsVersion(v)) {
                return v;
            }
        }
    } catch (error) {
        console.warn(error);
    }
    return null;
}
