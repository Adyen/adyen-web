import { getSanitizedResponse } from './utils';

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

            const sanitizedResponse = getSanitizedResponse(rawResponse);
            expect(sanitizedResponse.resultCode).toBeTruthy();
            expect(sanitizedResponse.sessionResult).toBeTruthy();
            expect((sanitizedResponse as any).someBackendProperty).toBeUndefined();
        });
    });
});
