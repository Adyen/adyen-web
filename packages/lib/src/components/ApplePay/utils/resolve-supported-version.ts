export function resolveSupportedVersion(latestVersion: number): number | null {
    try {
        for (let v = latestVersion; v > 0; v--) {
            if (ApplePaySession?.supportsVersion(v)) {
                return v;
            }
        }
    } catch (error) {
        console.warn(error);
    }
    return null;
}
