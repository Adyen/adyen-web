import { rivertyConsentUrlMap } from './config';

function getConsentLinkUrl(countryCode: string, locale: string): string {
    const languageCode = locale?.toLowerCase().slice(0, 2);
    const consentLink = rivertyConsentUrlMap[countryCode?.toLowerCase()]?.[languageCode];
    if (!consentLink) {
        console.warn(`Cannot find a consent url for the provided countryCode: ${countryCode} and locale: ${locale}`);
        return;
    }
    return consentLink;
}

export { getConsentLinkUrl };
