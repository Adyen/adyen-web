import { ThreeDS2Challenge } from './index';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors } from '../../core/Analytics/constants';
import { THREEDS2_CHALLENGE_ERROR } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('ThreeDS2Challenge', () => {
    describe('Analytics', () => {
        test('should not send "rendered" events', () => {
            const core = setupCoreMock();

            const threeDS2Challenge = new ThreeDS2Challenge(core, {
                onError: () => {}
            });

            threeDS2Challenge.render();

            const wasCalledWithRenderedEvent = (core.modules.analytics.sendAnalytics as jest.Mock).mock.calls.some(
                callArgs => callArgs[0].type === 'rendered'
            );

            expect(wasCalledWithRenderedEvent).toBe(false);
        });

        test('should generate analytics error event if not initiated with paymentData', () => {
            const core = setupCoreMock();

            const threeDS2Challenge = new ThreeDS2Challenge(core, {
                onError: () => {}
            });

            threeDS2Challenge.render();

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                component: 'threeDS2Challenge',
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });
});
