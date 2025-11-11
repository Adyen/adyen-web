import { ThreeDS2Challenge } from './index';
import { THREEDS2_CHALLENGE_ERROR } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ChallengeResolveData } from './types';
import { ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';

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
                errorType: ErrorEventType.apiError,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: ErrorEventCode.THREEDS2_ACTION_IS_MISSING_PAYMENT_DATA,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });

    describe('Additional details callbacks priority', () => {
        test('should call default additional details flow if "onComplete" is not present', () => {
            const core = setupCoreMock();

            const threeDS2Challenge = new ThreeDS2Challenge(core, {
                onError: () => {}
            });

            // @ts-ignore - spying internal method
            const spy = jest.spyOn(threeDS2Challenge, 'handleAdditionalDetails');
            const challengeResolveData: ChallengeResolveData = { data: { details: { foo: 'bar' } } };

            threeDS2Challenge.onComplete(challengeResolveData);

            expect(spy).toHaveBeenCalledWith(challengeResolveData);
        });

        test('should call "onComplete" if available', () => {
            const core = setupCoreMock();
            const onComplete = jest.fn();

            const threeDS2Challenge = new ThreeDS2Challenge(core, {
                onComplete
            });

            // @ts-ignore - spying internal method
            const spy = jest.spyOn(threeDS2Challenge, 'handleAdditionalDetails');
            const challengeResolveData: ChallengeResolveData = { data: { details: { foo: 'bar' } } };

            threeDS2Challenge.onComplete(challengeResolveData);

            expect(onComplete).toHaveBeenCalledWith(challengeResolveData, threeDS2Challenge);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
