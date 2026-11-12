import { getPhonePrefixForCountry, getSignupDetails, splitTelephoneNumber } from './utils';

describe('ClickToPaySignup utils', () => {
    describe('splitTelephoneNumber', () => {
        test('should return empty data when there is no telephone number', () => {
            expect(splitTelephoneNumber(undefined, ['+31'])).toEqual({});
            expect(splitTelephoneNumber('', ['+31'])).toEqual({});
        });

        test('should split on the longest matching prefix', () => {
            expect(splitTelephoneNumber('+351912345678', ['+3', '+35', '+351'])).toEqual({ phonePrefix: '+351', phoneNumber: '912345678' });
        });

        test('should ignore whitespace and separators', () => {
            expect(splitTelephoneNumber('+31 6-1234 5678', ['+31'])).toEqual({ phonePrefix: '+31', phoneNumber: '612345678' });
        });

        test('should keep only the digits when no prefix matches', () => {
            expect(splitTelephoneNumber('06 12345678', ['+31'])).toEqual({ phoneNumber: '0612345678' });
            expect(splitTelephoneNumber('+44 7700 900123', [])).toEqual({ phoneNumber: '447700900123' });
        });
    });

    describe('getPhonePrefixForCountry', () => {
        const phonePrefixes = [
            { id: '+31', name: '+31 (NL)', selectedOptionName: '+31' },
            { id: '+1', name: '+1 (US)', selectedOptionName: '+1' }
        ];

        test('should return the prefix of the country, ignoring the case of the country code', () => {
            expect(getPhonePrefixForCountry(phonePrefixes, 'nl')).toBe('+31');
            expect(getPhonePrefixForCountry(phonePrefixes, 'US')).toBe('+1');
        });

        test('should return undefined without a country code or a matching country', () => {
            expect(getPhonePrefixForCountry(phonePrefixes, undefined)).toBeUndefined();
            expect(getPhonePrefixForCountry(phonePrefixes, 'BR')).toBeUndefined();
        });
    });

    describe('getSignupDetails', () => {
        test('should join prefix and number', () => {
            expect(getSignupDetails({ phonePrefix: '+31', phoneNumber: '612345678' })).toEqual({ telephoneNumber: '+31612345678' });
        });

        test('should send the number alone when there is no prefix', () => {
            expect(getSignupDetails({ phoneNumber: '612345678' })).toEqual({ telephoneNumber: '612345678' });
        });

        test('should leave out a prefix without a number', () => {
            expect(getSignupDetails({ phonePrefix: '+31' })).toEqual({});
        });

        test('should trim values and leave out empty ones', () => {
            expect(getSignupDetails({ firstName: '  Jane ', lastName: '   ', shopperEmail: ' jane@example.com ' })).toEqual({
                firstName: 'Jane',
                shopperEmail: 'jane@example.com'
            });
        });
    });
});
