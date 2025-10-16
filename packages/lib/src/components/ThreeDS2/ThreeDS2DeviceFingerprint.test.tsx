import { ThreeDS2DeviceFingerprint } from './index';
import Analytics from '../../core/Analytics';
import { Analytics3DS2Errors, ANALYTICS_RENDERED_STR, ANALYTICS_ERROR_TYPE } from '../../core/Analytics/constants';
import { THREEDS2_FINGERPRINT_ERROR } from './constants';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';

const analyticsModule = Analytics({ analytics: {}, analyticsContext: '', locale: '', clientKey: '' });

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

        analyticsModule.sendAnalytics = jest.fn(() => null);
    });

    test('A call to ThreeDS2DeviceFingerprint.submitAnalytics with an object with type "rendered" should not lead to an analytics event', () => {
        fingerprint.submitAnalytics(new AnalyticsInfoEvent({ type: ANALYTICS_RENDERED_STR }));

        expect(analyticsModule.sendAnalytics).not.toHaveBeenCalled();
    });

    test('ThreeDS2DeviceFingerprint instantiated without paymentData should generate an analytics error', () => {
        const view = fingerprint.render();

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: fingerprint.constructor['type'],
            errorType: ANALYTICS_ERROR_TYPE.apiError,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'paymentData' property from threeDS2 action`,
            code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        expect(view).toBe(null);
    });
});
