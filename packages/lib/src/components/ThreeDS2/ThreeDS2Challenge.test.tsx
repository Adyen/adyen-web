import { ThreeDS2Challenge } from './index';
import Analytics from '../../core/Analytics';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, ANALYTICS_RENDERED_STR, ANALYTICS_EVENT } from '../../core/Analytics/constants';
import { THREEDS2_CHALLENGE_ERROR, THREEDS2_ERROR } from './constants';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', bundleType: 'umd' });

describe('ThreeDS2Challenge: calls that generate analytics should produce objects with the expected shapes ', () => {
    let challenge;
    beforeEach(() => {
        console.log = jest.fn(() => {});

        challenge = new ThreeDS2Challenge(global.core, {
            onActionHandled: () => {},
            modules: {
                analytics: analyticsModule
            },
            onError: () => {}
        });

        analyticsModule.createAnalyticsEvent = jest.fn(() => null);
    });

    test('A call to ThreeDS2Challenge.submitAnalytics with an object with type "rendered" should not lead to an analytics event', () => {
        challenge.submitAnalytics({ type: ANALYTICS_RENDERED_STR });

        expect(analyticsModule.createAnalyticsEvent).not.toHaveBeenCalled();
    });

    test('ThreeDS2Challenge instantiated without paymentData should generate an analytics error', () => {
        const view = challenge.render();

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.error,
            data: {
                component: challenge.constructor['type'],
                type: THREEDS2_ERROR,
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA
            }
        });

        expect(view).toBe(null);
    });
});
