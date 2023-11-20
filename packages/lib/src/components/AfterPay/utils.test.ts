import { getConsentLinkUrl } from './utils';
import { rivertyConsentUrlMap } from './config';

describe('getConsentLinkUrl', () => {
    describe('the country code is NL', () => {
        test('returns the english URL if the shopper locale is "en"', () => {
            expect(getConsentLinkUrl('nl', 'en')).toBe(rivertyConsentUrlMap.nl.en);
        });
        test('returns the NL URL if the shopper locale is "nl"', () => {
            expect(getConsentLinkUrl('nl', 'nl')).toBe(rivertyConsentUrlMap.nl.nl);
        });
    });
    describe('the country code is BE', () => {
        test('returns the english URL if the shopper locale is "en"', () => {
            expect(getConsentLinkUrl('be', 'en')).toBe(rivertyConsentUrlMap.be.en);
        });
        test('returns the NL URL if the shopper locale is "nl"', () => {
            expect(getConsentLinkUrl('be', 'nl')).toBe(rivertyConsentUrlMap.be.nl);
        });
        test('returns the FR URL if the shopper locale is "fr"', () => {
            expect(getConsentLinkUrl('be', 'fr')).toBe(rivertyConsentUrlMap.be.fr);
        });
    });
    describe('no supported country code & locale', () => {
        beforeEach(() => {
            console.warn = jest.fn();
        });
        test('should give a warning if no country code is provided', () => {
            getConsentLinkUrl(undefined, 'en');
            expect(console.warn).toBeCalled();
        });
        test('should give a warning if wrong country code is provided', () => {
            getConsentLinkUrl('WRONG', 'en');
            expect(console.warn).toBeCalled();
        });
        test('should give a warning if wrong locale is provided', () => {
            getConsentLinkUrl('nl', 'fr');
            expect(console.warn).toBeCalled();
        });
    });
});
