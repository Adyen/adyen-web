import { ThreeDS2DeviceFingerprint } from './index';
import Analytics from '../../core/Analytics';
import { ANALYTICS_API_ERROR, Analytics3DS2Errors, ANALYTICS_EVENT_ERROR, ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';
import { THREEDS2_ERROR, THREEDS2_FINGERPRINT_ERROR } from './constants';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', bundleType: 'umd' });

describe('ThreeDS2DeviceFingerprint: calls that generate analytics should produce objects with the expected shapes ', () => {
    let fingerprint;
    beforeEach(() => {
        console.log = jest.fn(() => {});

        fingerprint = new ThreeDS2DeviceFingerprint(global.core, {
            onActionHandled: () => {},
            modules: {
                analytics: analyticsModule
            },
            onError: () => {},
            showSpinner: null
        });

        analyticsModule.createAnalyticsEvent = jest.fn(() => null);
    });

    test('A call to ThreeDS2DeviceFingerprint.submitAnalytics with an object with type "rendered" should not lead to an analytics event', () => {
        fingerprint.submitAnalytics({ type: ANALYTICS_RENDERED_STR });

        expect(analyticsModule.createAnalyticsEvent).not.toHaveBeenCalled();
    });

    test('ThreeDS2DeviceFingerprint instantiated without paymentData should generate an analytics error', () => {
        const view = fingerprint.render();

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_ERROR,
            data: {
                component: fingerprint.constructor['type'],
                type: THREEDS2_ERROR,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA
            }
        });

        expect(view).toBe(null);
    });
});
