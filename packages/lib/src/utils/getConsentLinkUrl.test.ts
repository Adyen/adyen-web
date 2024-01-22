import { getConsentUrl } from './getConsentUrl';

const rivertyConsentUrlMap = {
    be: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_en',
        fr: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_fr',
        nl: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/be_nl'
    },
    nl: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/nl_en',
        nl: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/nl_nl'
    }
};
describe('getConsentLinkUrl', () => {
    describe('the country code is NL', () => {
        test('returns the english URL if the shopper locale is "en"', () => {
            expect(getConsentUrl('nl', 'en', rivertyConsentUrlMap)).toBe(rivertyConsentUrlMap.nl.en);
        });
        test('returns the NL URL if the shopper locale is "nl"', () => {
            expect(getConsentUrl('nl', 'nl', rivertyConsentUrlMap)).toBe(rivertyConsentUrlMap.nl.nl);
        });
    });
    describe('the country code is BE', () => {
        test('returns the english URL if the shopper locale is "en"', () => {
            expect(getConsentUrl('be', 'en', rivertyConsentUrlMap)).toBe(rivertyConsentUrlMap.be.en);
        });
        test('returns the NL URL if the shopper locale is "nl"', () => {
            expect(getConsentUrl('be', 'nl', rivertyConsentUrlMap)).toBe(rivertyConsentUrlMap.be.nl);
        });
        test('returns the FR URL if the shopper locale is "fr"', () => {
            expect(getConsentUrl('be', 'fr', rivertyConsentUrlMap)).toBe(rivertyConsentUrlMap.be.fr);
        });
    });
    describe('no supported country code & locale', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });
        test('should give a warning if no country code is provided', () => {
            getConsentUrl(undefined, 'en', rivertyConsentUrlMap);
            expect(console.warn).toBeCalled();
        });
        test('should give a warning if wrong country code is provided', () => {
            getConsentUrl('WRONG', 'en', rivertyConsentUrlMap);
            expect(console.warn).toBeCalled();
        });
        test('should give a warning if wrong locale is provided', () => {
            getConsentUrl('nl', 'fr', rivertyConsentUrlMap);
            expect(console.warn).toBeCalled();
        });
    });
});
