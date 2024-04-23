export const resolveEnvironment = (env = '', environmentMap: Record<string, string>, environmentUrl?: string): string => {
    if (environmentUrl) {
        return environmentUrl;
    }

    return environmentMap[env.toLowerCase()] || environmentMap.fallback;
};
