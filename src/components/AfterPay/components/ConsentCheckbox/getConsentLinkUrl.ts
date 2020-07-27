import { AFTERPAY_CONSENT_URL_EN, AFTERPAY_CONSENT_URL_BE, AFTERPAY_CONSENT_URL_NL } from '../../config';

export default function getConsentLinkUrl(countryCode, languageCode) {
    if (languageCode === 'en') return AFTERPAY_CONSENT_URL_EN;
    if (countryCode === 'be') return AFTERPAY_CONSENT_URL_BE;
    return AFTERPAY_CONSENT_URL_NL;
}
