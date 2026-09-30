import { getRegulatoryDefaults, sanitizeResponse } from './utils';

describe('components utils', () => {
    describe('getSanitizedResponse', () => {
        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('filters unallowed properties', () => {
            const rawResponse = {
                resultCode: 'Authorised' as const,
                someBackendProperty: true,
                sessionResult: 'XYZ123'
            };

            const sanitizedResponse = sanitizeResponse(rawResponse);
            expect(sanitizedResponse.resultCode).toBeTruthy();
            expect(sanitizedResponse.sessionResult).toBeTruthy();
            expect((sanitizedResponse as any).someBackendProperty).toBeUndefined();
        });

        test('should warn about every removed property', () => {
            sanitizeResponse({ resultCode: 'Authorised', someBackendProperty: true, anotherBackendProperty: 'value' });

            expect(console.warn).toHaveBeenCalledWith(
                'The following properties should not be passed to the client: someBackendProperty, anotherBackendProperty'
            );
        });

        test('should not warn when all properties are allowed', () => {
            sanitizeResponse({ resultCode: 'Authorised', sessionResult: 'XYZ123' });

            expect(console.warn).not.toHaveBeenCalled();
        });
    });

    describe('getRegulatoryDefaults', () => {
        test('should not open any payment method by default for a Finnish Drop-in', () => {
            expect(getRegulatoryDefaults('FI', true)).toEqual({ openFirstPaymentMethod: false, openFirstStoredPaymentMethod: false });
        });

        test('should return no defaults for a Finnish standalone component', () => {
            expect(getRegulatoryDefaults('FI', false)).toEqual({});
        });

        test('should return no defaults for a country without regulations', () => {
            expect(getRegulatoryDefaults('NL', true)).toEqual({});
        });

        test('should return no defaults when the country code is undefined', () => {
            expect(getRegulatoryDefaults(undefined, true)).toEqual({});
        });
    });
});
