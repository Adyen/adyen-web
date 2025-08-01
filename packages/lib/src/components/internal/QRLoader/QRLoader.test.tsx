import { h } from 'preact';
import { render, waitFor } from '@testing-library/preact';
import QRLoader from './QRLoader';
import checkPaymentStatus from '../../../core/Services/payment-status';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { QRLoaderProps } from './types';

jest.mock('../../../core/Services/payment-status');
jest.useFakeTimers();

const renderQRLoader = (props: Partial<QRLoaderProps> = {}) => {
    const srPanel = new SRPanel(global.core);
    const defaultProps: QRLoaderProps = {
        onComplete: jest.fn(),
        onError: jest.fn(),
        paymentData: 'initial-payment-data',
        i18n: global.i18n,
        loadingContext: 'test',
        clientKey: 'test_key'
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>
                <QRLoader {...mergedProps} />
            </SRPanelProvider>
        </CoreProvider>
    );

    return {
        onCompleteMock: mergedProps.onComplete as jest.Mock,
        onErrorMock: mergedProps.onError as jest.Mock
    };
};

describe('QRLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test('should poll for status and call onComplete when authorised', async () => {
        const paymentData = 'initial-payment-data';
        const authorisedResponse = { payload: 'details-payload', resultCode: 'authorised', type: 'complete' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(authorisedResponse);

        const expectedOnCompleteData = {
            data: {
                details: { payload: 'details-payload' },
                paymentData: paymentData
            }
        };

        const { onCompleteMock, onErrorMock } = renderQRLoader({ paymentData });

        jest.runAllTimers();

        // Polling should start immediately on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);

        // Wait for the async onComplete callback to be called
        await waitFor(() => {
            expect(onCompleteMock).toHaveBeenCalledTimes(1);
        });
        expect(onCompleteMock).toHaveBeenCalledWith(expectedOnCompleteData, expect.any(Object));
        expect(onErrorMock).not.toHaveBeenCalled();

        // Verify that polling has stopped
        jest.runOnlyPendingTimers();
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);
    });

    test('should poll for status and call onError when status is an error', async () => {
        (checkPaymentStatus as jest.Mock).mockResolvedValue({ type: 'validation' });

        const { onCompleteMock, onErrorMock } = renderQRLoader();

        jest.runAllTimers();

        // Polling starts on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);

        // Wait for the onError callback
        await waitFor(() => {
            expect(onErrorMock).toHaveBeenCalledTimes(1);
        });

        expect(onErrorMock).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'error result with no payload in response'));
        expect(onCompleteMock).not.toHaveBeenCalled();

        // Verify that polling has stopped
        jest.runOnlyPendingTimers();
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);
    });

    test('should keep polling if status is pending', async () => {
        const pendingResponse = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(pendingResponse);

        const { onCompleteMock, onErrorMock } = renderQRLoader({ delay: 1000 });

        jest.runAllTimers();

        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(1));
        expect(onCompleteMock).not.toHaveBeenCalled();
        expect(onErrorMock).not.toHaveBeenCalled();

        // Advance time to trigger the second poll
        jest.advanceTimersByTime(1000);
        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(2));

        // Advance time again for the third poll
        jest.advanceTimersByTime(1000);
        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(3));
    });

    test('should use throttledInterval after throttleTime has passed', async () => {
        const pendingResponse = { resultCode: 'pending' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(pendingResponse);
        jest.spyOn(global, 'setTimeout');

        renderQRLoader({
            delay: 1000,
            throttleTime: 0,
            throttledInterval: 2000
        });

        jest.runAllTimers();

        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(1));
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
    });
});
