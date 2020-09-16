import { getConsentLinkUrl } from './utils';
import { AFTERPAY_CONSENT_URL_BE, AFTERPAY_CONSENT_URL_EN, AFTERPAY_CONSENT_URL_NL } from './config';

describe('getConsentLinkUrl', () => {
    test('returns the english URL if the locale is "en"', () => {
        expect(getConsentLinkUrl('', 'en')).toBe(AFTERPAY_CONSENT_URL_EN);
        expect(getConsentLinkUrl('', 'EN')).toBe(AFTERPAY_CONSENT_URL_EN);
        expect(getConsentLinkUrl('', 'en_US')).toBe(AFTERPAY_CONSENT_URL_EN);
        expect(getConsentLinkUrl('', 'en_GB')).toBe(AFTERPAY_CONSENT_URL_EN);
    });

    test('returns the english URL if the country code is "BE"', () => {
        expect(getConsentLinkUrl('BE', '')).toBe(AFTERPAY_CONSENT_URL_BE);
        expect(getConsentLinkUrl('be', '')).toBe(AFTERPAY_CONSENT_URL_BE);
    });

    test('returns the URL for Netherlands otherwise', () => {
        expect(getConsentLinkUrl('', '')).toBe(AFTERPAY_CONSENT_URL_NL);
        expect(getConsentLinkUrl('es', 'ES')).toBe(AFTERPAY_CONSENT_URL_NL);
    });
});
