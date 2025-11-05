import { ThreeDS2DeviceFingerprint } from './index';
import { Analytics3DS2Errors, ANALYTICS_ERROR_TYPE } from '../../core/Analytics/constants';
import { THREEDS2_FINGERPRINT_ERROR } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { render } from '@testing-library/preact';

describe('ThreeDS2DeviceFingerprint', () => {
    describe('Analytics', () => {
        test('should not send "rendered" events', () => {
            const core = setupCoreMock();

            const fingerprintComponent = new ThreeDS2DeviceFingerprint(core, {
                paymentData: 'payment-data',
                token: 'xxx',
                showSpinner: null
            });
            render(fingerprintComponent.render());

            const wasCalledWithRenderedEvent = (core.modules.analytics.sendAnalytics as jest.Mock).mock.calls.some(
                callArgs => callArgs[0].type === 'rendered'
            );

            expect(wasCalledWithRenderedEvent).toBe(false);
        });

        test('should generate analytics error event if not initiated with paymentData', () => {
            const core = setupCoreMock();

            const fingerprintComponent = new ThreeDS2DeviceFingerprint(core, {
                token: 'xxx',
                onError: () => {},
                showSpinner: null
            });
            render(fingerprintComponent.render());

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                component: fingerprintComponent.constructor['type'],
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'paymentData' property from threeDS2 action`,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });

    test('ThreeDS2DeviceFingerprint - when onComplete is called handleAdditionalDetails should then be called ', () => {
        const spy = jest.spyOn(fingerprint, 'handleAdditionalDetails');

        fingerprint.onComplete({ foo: 'bar' });

        expect(spy).toHaveBeenCalledWith({ foo: 'bar' });
    });

    test('ThreeDS2DeviceFingerprint - when onComplete is called the passed onComplete function should then be called', () => {
        const onComplete = jest.fn();

        const nuFingerprint = new ThreeDS2DeviceFingerprint(global.core, {
            onActionHandled: () => {},
            modules: {
                analytics: analyticsModule
            },
            onError: () => {},
            showSpinner: null,
            onComplete
        });

        // @ts-ignore - spied on function does exist
        const spy = jest.spyOn(nuFingerprint, 'handleAdditionalDetails');

        // @ts-ignore - we don't care about the type
        nuFingerprint.onComplete({ foo: 'bar' });

        expect(onComplete).toHaveBeenCalledWith({ foo: 'bar' }, nuFingerprint);

        expect(spy).not.toHaveBeenCalled();
    });
});
