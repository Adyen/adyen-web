import { ThreeDS2Challenge } from './index';
import Analytics from '../../core/Analytics';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';
import { THREEDS2_CHALLENGE_ERROR } from './constants';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';

const analyticsModule = Analytics({ analytics: {}, analyticsContext: '', locale: '', clientKey: '' });

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

        analyticsModule.sendAnalytics = jest.fn(() => null);
    });

    test('A call to ThreeDS2Challenge.submitAnalytics with an object with type "rendered" should not lead to an analytics event', () => {
        challenge.submitAnalytics(new AnalyticsInfoEvent({ type: ANALYTICS_RENDERED_STR }));

        expect(analyticsModule.sendAnalytics).not.toHaveBeenCalled();
    });

    test('ThreeDS2Challenge instantiated without paymentData should generate an analytics error', () => {
        const view = challenge.render();

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: challenge.constructor['type'],
            errorType: ANALYTICS_ERROR_TYPE.apiError,
            message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`,
            code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        expect(view).toBe(null);
    });

    test('ThreeDS2Challenge - when onComplete is called handleAdditionalDetails should then be called ', () => {
        const spy = jest.spyOn(challenge, 'handleAdditionalDetails');

        challenge.onComplete({ foo: 'bar' });

        expect(spy).toHaveBeenCalledWith({ foo: 'bar' });
    });

    test('ThreeDS2Challenge - when onComplete is called the passed onComplete function should then be called', () => {
        const onComplete = jest.fn();

        const nuChallenge = new ThreeDS2Challenge(global.core, {
            onActionHandled: () => {},
            modules: {
                analytics: analyticsModule
            },
            onError: () => {},
            onComplete
        });

        // @ts-ignore - spied on function does exist
        const spy = jest.spyOn(nuChallenge, 'handleAdditionalDetails');

        // @ts-ignore - we don't care about the type
        nuChallenge.onComplete({ foo: 'bar' });

        expect(onComplete).toHaveBeenCalledWith({ foo: 'bar' }, nuChallenge);

        expect(spy).not.toHaveBeenCalled();
    });
});
