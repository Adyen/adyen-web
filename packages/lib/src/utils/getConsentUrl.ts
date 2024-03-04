type UrlMap = {
    [countryCode: string]: {
        [language: string]: string;
    };
};

function getConsentUrl(countryCode: string, locale: string, urlMap: UrlMap): string {
    const languageCode = locale?.toLowerCase().slice(0, 2);
    const consentLink = urlMap[countryCode?.toLowerCase()]?.[languageCode];
    if (!consentLink) {
        console.warn(`Cannot find a consent url for the provided countryCode: ${countryCode} and locale: ${locale}`);
        return;
    }
    return consentLink;
}

export { getConsentUrl };
