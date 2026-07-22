import { h } from 'preact';
import { render, screen, act } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';

import GoogleAcceleratedCheckout, { GOOGLE_PAY_ACCELERATED_DIV_ID } from './GoogleAcceleratedCheckout';
import GoogleAcceleratedCheckoutClient, { PaymentSheetResize } from '../services/GoogleAcceleratedCheckoutClient';

describe('GoogleAcceleratedCheckout', () => {
    const getContainer = () => screen.getByTestId(GOOGLE_PAY_ACCELERATED_DIV_ID);

    test('should call "onFail" when the client fails to load', async () => {
        const paymentsClient = mock<GoogleAcceleratedCheckoutClient>();
        const onFail = jest.fn();
        paymentsClient.load.mockResolvedValue({ status: 'ERROR' });
        paymentsClient.onPaymentSheetResize.mockReturnValue(() => {});

        render(<GoogleAcceleratedCheckout paymentsClient={paymentsClient} onFail={onFail} />);

        await new Promise(process.nextTick);

        expect(onFail).toHaveBeenCalledTimes(1);
    });

    test('should subscribe to resize events and apply the reported height to the container', async () => {
        const paymentsClient = mock<GoogleAcceleratedCheckoutClient>();
        let resizeCallback: (resize: PaymentSheetResize) => void;
        paymentsClient.load.mockResolvedValue({ status: 'SUCCESS' });
        paymentsClient.onPaymentSheetResize.mockImplementation(callback => {
            resizeCallback = callback;
            return () => {};
        });

        render(<GoogleAcceleratedCheckout paymentsClient={paymentsClient} onFail={jest.fn()} />);

        await new Promise(process.nextTick);

        expect(paymentsClient.onPaymentSheetResize).toHaveBeenCalledTimes(1);

        await act(() => {
            resizeCallback({ height: 500, heightCss: '500px' });
        });

        expect(getContainer()).toHaveStyle({ height: '500px' });
    });

    test('should apply the last emitted value when resize is triggered multiple times', async () => {
        const paymentsClient = mock<GoogleAcceleratedCheckoutClient>();
        let resizeCallback: (resize: PaymentSheetResize) => void;
        paymentsClient.load.mockResolvedValue({ status: 'SUCCESS' });
        paymentsClient.onPaymentSheetResize.mockImplementation(callback => {
            resizeCallback = callback;
            return () => {};
        });

        render(<GoogleAcceleratedCheckout paymentsClient={paymentsClient} onFail={jest.fn()} />);

        await new Promise(process.nextTick);

        await act(() => {
            resizeCallback({ height: 300, heightCss: '300px' });
            resizeCallback({ height: 620, heightCss: '620px' });
        });

        expect(getContainer()).toHaveStyle({ height: '620px' });
    });

    test('should unsubscribe from resize events on unmount', async () => {
        const paymentsClient = mock<GoogleAcceleratedCheckoutClient>();
        const unsubscribe = jest.fn();
        paymentsClient.load.mockResolvedValue({ status: 'SUCCESS' });
        paymentsClient.onPaymentSheetResize.mockReturnValue(unsubscribe);

        const { unmount } = render(<GoogleAcceleratedCheckout paymentsClient={paymentsClient} onFail={jest.fn()} />);

        await new Promise(process.nextTick);

        unmount();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
