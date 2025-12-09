import { h } from 'preact';
import { render, waitFor, screen } from '@testing-library/preact';
import { QRLoader } from './QRLoader';
import checkPaymentStatus from '../../../core/Services/payment-status';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { QRLoaderProps } from './types';

jest.mock('../../../core/Services/payment-status');

const TIMEOUT_OFFSET = 200;

const renderQRLoader = (props: Partial<QRLoaderProps> = {}) => {
    const srPanel = new SRPanel(global.core);
    const defaultProps: QRLoaderProps = {
        type: 'pix',
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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should poll for status and call onComplete when authorised', async () => {
        const paymentData = 'initial-payment-data';
        const authorisedResponse = { payload: 'details-payload', resultCode: 'authorised', type: 'complete' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(authorisedResponse);
        jest.spyOn(global, 'setTimeout');
        const delay = 200;

        const expectedOnCompleteData = {
            data: {
                details: { payload: 'details-payload' },
                paymentData: paymentData
            }
        };

        const { onCompleteMock, onErrorMock } = renderQRLoader({ delay, paymentData });

        // Polling should start immediately on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);

        // Wait for the onComplete callback to be called
        await waitFor(() => expect(onCompleteMock).toHaveBeenCalledTimes(1));
        expect(onCompleteMock).toHaveBeenCalledWith(expectedOnCompleteData);
        expect(onErrorMock).not.toHaveBeenCalled();

        expect(screen.getByTestId('Payment Successful')).toBeInTheDocument();

        // Verify that polling has stopped
        jest.runAllTimers();
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);
        expect(setTimeout).not.toHaveBeenCalledWith(expect.any(Function), delay);
    });

    test('should poll for status and call onError when status is an error', async () => {
        (checkPaymentStatus as jest.Mock).mockResolvedValue({ type: 'validation' });
        jest.spyOn(global, 'setTimeout');
        const delay = 200;

        const { onCompleteMock, onErrorMock } = renderQRLoader({ delay });

        // Polling should start immediately on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);

        // Wait for the onError callback to be called
        await waitFor(() => expect(onErrorMock).toHaveBeenCalledTimes(1));
        expect(onErrorMock).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'error result with no payload in response'));
        expect(onCompleteMock).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByTestId('Payment failed')).toBeInTheDocument();
        });

        // Verify that polling has stopped
        jest.runAllTimers();
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);
        expect(setTimeout).not.toHaveBeenCalledWith(expect.any(Function), delay);
    });

    test('should keep polling if status is pending', async () => {
        const pendingResponse = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(pendingResponse);
        const delay = 1000;

        const { onCompleteMock, onErrorMock } = renderQRLoader({ delay });

        // Polling should start immediately on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);
        expect(onCompleteMock).not.toHaveBeenCalled();
        expect(onErrorMock).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText('Scan QR code')).toBeInTheDocument();
        });

        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(2), { timeout: delay + TIMEOUT_OFFSET });

        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(3), { timeout: delay * 2 + TIMEOUT_OFFSET });
    });

    test('should use throttledInterval after throttleTime has passed', async () => {
        const pendingResponse = { resultCode: 'pending' };
        (checkPaymentStatus as jest.Mock).mockResolvedValue(pendingResponse);
        jest.spyOn(global, 'setTimeout');
        const delay = 1000;
        const throttledInterval = 2000;

        renderQRLoader({
            delay,
            throttleTime: 0,
            throttledInterval
        });

        // Polling should start immediately on render
        expect(checkPaymentStatus).toHaveBeenCalledTimes(1);

        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(2), { timeout: delay + TIMEOUT_OFFSET });
        await waitFor(() => expect(checkPaymentStatus).toHaveBeenCalledTimes(3), { timeout: throttledInterval + TIMEOUT_OFFSET });
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), throttledInterval);
    });
});
