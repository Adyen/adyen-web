import { sanitizeResponse, searchObject } from './utils';

describe('components utils', () => {
    describe('getSanitizedResponse', () => {
        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
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
    });

    describe.only('searchObject util', () => {
        test('test that no results are found because there is nothing to search', () => {
            const errors = null;

            const result = searchObject(errors, 'age');

            expect(result.length).toEqual(0);
        });

        test('test that no results are found because there is no matching entry', () => {
            const errors = {
                personalDetails: {
                    firstName: null,
                    lastName: null,
                    telephoneNumber: null,
                    shopperEmail: null
                },
                billingAddress: {
                    country: null,
                    street: null,
                    houseNumberOrName: null,
                    city: null,
                    stateOrProvince: null,
                    postalCode: null,
                    firstName: null,
                    lastName: null
                }
            };

            const result = searchObject(errors, 'age');

            expect(result.length).toEqual(0);
        });

        test('test that no results are found because there is not a "truthy" values', () => {
            const errors = {
                personalDetails: {
                    firstName: null,
                    lastName: null,
                    telephoneNumber: null,
                    shopperEmail: null
                },
                billingAddress: {
                    country: null,
                    street: null,
                    houseNumberOrName: null,
                    city: null,
                    stateOrProvince: null,
                    postalCode: null,
                    firstName: null,
                    lastName: null
                }
            };

            const result = searchObject(errors, 'firstName');

            expect(result.length).toEqual(0);
        });

        test('test that a result is found because there a "truthy" value: a boolean', () => {
            const errors = {
                personalDetails: {
                    firstName: null,
                    lastName: null,
                    telephoneNumber: null,
                    shopperEmail: null
                },
                billingAddress: {
                    country: null,
                    street: null,
                    houseNumberOrName: null,
                    city: null,
                    stateOrProvince: null,
                    postalCode: true,
                    firstName: null,
                    lastName: null
                }
            };

            const result = searchObject(errors, 'postalCode');

            expect(result.length).toEqual(1);
        });

        test('test that a result is found because there a "truthy" value: an object', () => {
            const errors = {
                personalDetails: {
                    firstName: null,
                    lastName: null,
                    telephoneNumber: null,
                    shopperEmail: { hasError: true }
                },
                billingAddress: {
                    country: null,
                    street: null,
                    houseNumberOrName: null,
                    city: null,
                    stateOrProvince: null,
                    postalCode: true,
                    firstName: null,
                    lastName: null
                }
            };

            const result = searchObject(errors, 'shopperEmail');

            expect(result.length).toEqual(1);
        });

        test('test that a result is found in a object without nesting', () => {
            const errors = {
                holderName: null,
                socialSecurityNumber: true,
                taxNumber: null,
                billingAddress: null
            };

            const result = searchObject(errors, 'socialSecurityNumber');

            expect(result.length).toEqual(1);
        });
    });
});
