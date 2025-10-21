import { ThreeDS2DeviceFingerprint } from './index';
import { Analytics3DS2Errors, ANALYTICS_ERROR_TYPE } from '../../core/Analytics/constants';
import { THREEDS2_FINGERPRINT_ERROR } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { render } from '@testing-library/preact';

describe('ThreeDS2DeviceFingerprint', () => {
    describe('Analytics', () => {
        test('should not send "rendered" events', async () => {
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
});
