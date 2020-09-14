import { AFTERPAY_CONSENT_URL_BE, AFTERPAY_CONSENT_URL_EN, AFTERPAY_CONSENT_URL_NL } from './config';

function getConsentLinkUrl(countryCode: string, locale: string): string {
    const languageCode = locale?.toLowerCase().slice(0, 2);
    if (languageCode === 'en') return AFTERPAY_CONSENT_URL_EN;
    if (countryCode?.toLowerCase() === 'be') return AFTERPAY_CONSENT_URL_BE;
    return AFTERPAY_CONSENT_URL_NL;
}

export { getConsentLinkUrl };
