type UrlMap = {
    [countryCode: string]: {
        [language: string]: string;
    };
};

const FALLBACK_CONSENT_LANGUAGE = 'en';

function getConsentUrl(countryCode: string | undefined, locale: string | undefined, urlMap: UrlMap): string | undefined {
    const countryUrls = countryCode ? urlMap[countryCode.toLowerCase()] : undefined;
    const consentUrl = locale ? countryUrls?.[locale.toLowerCase().slice(0, 2)] : undefined;
    if (consentUrl) {
        return consentUrl;
    }

    console.warn(`Cannot find a consent url for the provided countryCode: ${countryCode} and locale: ${locale}`);
    return countryUrls?.[FALLBACK_CONSENT_LANGUAGE];
}

export { getConsentUrl };
