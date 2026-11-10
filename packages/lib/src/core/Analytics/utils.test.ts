import { mapErrorCodesForAnalytics, processAnalyticsData } from './utils';
import { CREDITCARD_HOLDER_NAME_INVALID, ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../Errors/constants';

describe('Analytics utils', () => {
    describe('mapErrorCodesForAnalytics', () => {
        test('should map a generic "field required" error code combined with its target', () => {
            expect(mapErrorCodesForAnalytics(ERROR_FIELD_REQUIRED, 'postal_code')).toBe('933');
        });

        test('should map a generic "invalid format" error code combined with its target', () => {
            expect(mapErrorCodesForAnalytics(ERROR_INVALID_FORMAT_EXPECTS, 'postal_code')).toBe('934');
        });

        test('should return the generic error code unchanged when no target is provided', () => {
            expect(mapErrorCodesForAnalytics(ERROR_FIELD_REQUIRED)).toBe(ERROR_FIELD_REQUIRED);
            expect(mapErrorCodesForAnalytics(ERROR_INVALID_FORMAT_EXPECTS)).toBe(ERROR_INVALID_FORMAT_EXPECTS);
        });

        test('should return the generic error code unchanged when the target has no mapping', () => {
            expect(mapErrorCodesForAnalytics(ERROR_FIELD_REQUIRED, 'unknown_field')).toBe(ERROR_FIELD_REQUIRED);
        });

        test('should map a specific error code without needing a target', () => {
            expect(mapErrorCodesForAnalytics(CREDITCARD_HOLDER_NAME_INVALID)).toBe('925');
        });

        test('should strip non-digits from an unmapped error code', () => {
            expect(mapErrorCodesForAnalytics('error.va.sf-cc-cvc.02')).toBe('02');
        });
    });

    describe('processAnalyticsData', () => {
        test('should return an empty object when no analytics data is provided', () => {
            expect(processAnalyticsData()).toEqual({});
        });

        test('should only keep the allowed analytics data properties', () => {
            const applicationInfo = {
                externalPlatform: { name: 'platform', version: '1.0.0', integrator: 'integrator' },
                merchantApplication: { name: 'app', version: '1.0.0' }
            };
            const analyticsData = { applicationInfo, checkoutAttemptId: 'attempt-id', notAllowed: 'value' };

            expect(processAnalyticsData(analyticsData)).toEqual({ applicationInfo, checkoutAttemptId: 'attempt-id' });
        });

        test('should omit allowed properties that are undefined', () => {
            expect(processAnalyticsData({ checkoutAttemptId: 'attempt-id' })).toEqual({ checkoutAttemptId: 'attempt-id' });
        });
    });
});
