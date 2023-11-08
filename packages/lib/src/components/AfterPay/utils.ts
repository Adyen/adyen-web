import { rivertyConsentUrlMap } from './config';

function getConsentLinkUrl(countryCode: string, locale: string): string {
    const languageCode = locale?.toLowerCase().slice(0, 2);
    return rivertyConsentUrlMap[countryCode?.toLowerCase()]?.[languageCode];
}

export { getConsentLinkUrl };
