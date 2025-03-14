import { ANALYTICS_ENVIRONMENTS, API_ENVIRONMENTS, CDN_ENVIRONMENTS } from './constants';
import type { CoreConfiguration } from '../types';

const getUrlFromMap = (env: CoreConfiguration['environment'], environmentMap: Record<string, string>, environmentUrl?: string): string => {
    if (environmentUrl) {
        return environmentUrl;
    }
    return environmentMap[env?.toLowerCase()] || environmentMap.fallback;
};

export const resolveEnvironments = (environment: CoreConfiguration['environment'], environmentsUrls?: CoreConfiguration['_environmentUrls']) => {
    const apiUrl = getUrlFromMap(environment, API_ENVIRONMENTS, environmentsUrls?.api);
    const analyticsUrl = getUrlFromMap(environment, ANALYTICS_ENVIRONMENTS, environmentsUrls?.analytics);
    const cdnImagesUrl = getUrlFromMap(environment, CDN_ENVIRONMENTS, environmentsUrls?.cdn?.images);
    // When running local OR when running E2E test on CI we want to fetch translations locally
    const cdnTranslationsUrl =
        process.env.NODE_ENV === 'development' || process.env.CI === 'true'
            ? '/'
            : getUrlFromMap(environment, CDN_ENVIRONMENTS, environmentsUrls?.cdn?.translations);

    return {
        apiUrl,
        analyticsUrl,
        cdnImagesUrl,
        cdnTranslationsUrl
    };
};
