import { ThreeDS2Challenge } from './index';
import Analytics from '../../core/Analytics';
import {
    ANALYTICS_API_ERROR,
    ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA,
    ANALYTICS_EVENT_ERROR,
    ANALYTICS_RENDERED_STR
} from '../../core/Analytics/constants';
import { THREEDS2_CHALLENGE_ERROR, THREEDS2_ERROR } from './config';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '' });

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
            event: ANALYTICS_EVENT_ERROR,
            data: {
                component: challenge.constructor['type'],
                type: THREEDS2_ERROR,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA
            }
        });

        expect(view).toBe(null);
    });
});
