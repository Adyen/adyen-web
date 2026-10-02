type UrlMap = {
    [countryCode: string]: {
        [language: string]: string;
    };
};

const FALLBACK_CONSENT_LANGUAGE = 'en';

function getConsentUrl(countryCode: string | undefined, locale: string | undefined, urlMap: UrlMap): string | undefined {
    const countryConsentUrls = countryCode ? urlMap[countryCode.toLowerCase()] : undefined;
    const consentLink = locale ? countryConsentUrls?.[locale.toLowerCase().slice(0, 2)] : undefined;
    if (consentLink) {
        return consentLink;
    }

    const fallbackConsentLink = countryConsentUrls?.[FALLBACK_CONSENT_LANGUAGE];
    if (fallbackConsentLink) {
        console.warn(`Cannot find a consent url for the provided countryCode: ${countryCode} and locale: ${locale}, falling back to English`);
        return fallbackConsentLink;
    }

    console.warn(`Cannot find a consent url for the provided countryCode: ${countryCode} and locale: ${locale}`);
    return;
}

export { getConsentUrl };
