import { getSanitizedResponse } from './utils';

describe('components utils', () => {
    describe('getSanitizedResponse', () => {
        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        test('filters unallowed properties', () => {
            const rawResponse = {
                resultCode: 'Authorised',
                someBackendProperty: true
            };

            const sanitizedResponse = getSanitizedResponse(rawResponse);
            expect(sanitizedResponse.resultCode).toBeTruthy();
            expect((sanitizedResponse as any).someBackendProperty).toBeUndefined();
        });
    });
});
