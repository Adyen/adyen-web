import { h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalComponentV6 } from './PaypalComponentV6';
import type { PayPalComponentV6Props } from './types';
import type { PayPalService } from '../services/PayPalService';
import type { ComponentMethodsRef, UIElementStatus } from '../../types';

jest.mock('./PayPalButton', () => ({ PayPalButton: () => <div data-testid="paypal-button" /> }));
jest.mock('./PayPalPayLaterButton', () => ({ PayPalPayLaterButton: () => <div data-testid="paypal-pay-later-button" /> }));
jest.mock('./PayPalCreditButton', () => ({ PayPalCreditButton: () => <div data-testid="paypal-credit-button" /> }));
jest.mock('./VenmoButton', () => ({ VenmoButton: () => <div data-testid="venmo-button" /> }));
jest.mock('./PayPalProcessingSpinner', () => ({
    PayPalProcessingSpinner: ({ withoutReviewPage }: Readonly<{ withoutReviewPage: boolean }>) => (
        <div data-testid="paypal-processing-spinner" data-with-review-page={String(withoutReviewPage)} />
    )
}));

const createProps = (overrides: Partial<PayPalComponentV6Props> = {}): PayPalComponentV6Props => {
    const paypalService = mock<PayPalService>();
    paypalService.isSdkLoaded.mockResolvedValue(undefined);

    return {
        paypalService,
        style: { paypal: { type: 'pay', class: 'paypal-gold' }, venmo: { type: 'pay', class: 'venmo-blue' } },
        commit: true,
        vault: false,
        onSubmit: jest.fn(),
        onApprove: jest.fn(),
        onShippingAddressChange: jest.fn(),
        onShippingOptionsChange: jest.fn(),
        onCancel: jest.fn(),
        onError: jest.fn(),
        setComponentRef: jest.fn(),
        ...overrides
    };
};

describe('PayPalComponentV6', () => {
    test('should render the loader while the SDK is still loading', () => {
        const paypalService = mock<PayPalService>();
        // Never resolves, so the component stays in the pending state
        paypalService.isSdkLoaded.mockReturnValue(new Promise(() => {}));

        render(<PayPalComponentV6 {...createProps({ paypalService })} />);

        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-component')).not.toBeInTheDocument();
    });

    test('should expose the component ref through setComponentRef on mount', () => {
        const setComponentRef = jest.fn();
        render(<PayPalComponentV6 {...createProps({ setComponentRef })} />);

        expect(setComponentRef).toHaveBeenCalledTimes(1);
        expect(setComponentRef).toHaveBeenCalledWith(expect.objectContaining({ setStatus: expect.any(Function) }));
    });

    test('should render the container and all buttons once the SDK is loaded', async () => {
        render(<PayPalComponentV6 {...createProps()} />);

        expect(await screen.findByTestId('paypal-component')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-pay-later-button')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-credit-button')).toBeInTheDocument();
        expect(screen.getByTestId('venmo-button')).toBeInTheDocument();
    });

    test('should not render the pay later button when blocked', async () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalPayLaterButton: true })} />);

        expect(await screen.findByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-pay-later-button')).not.toBeInTheDocument();
    });

    test('should not render the credit button when blocked', async () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalCreditButton: true })} />);

        expect(await screen.findByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-button')).not.toBeInTheDocument();
    });

    test('should not render the venmo button when blocked', async () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalVenmoButton: true })} />);

        expect(await screen.findByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.queryByTestId('venmo-button')).not.toBeInTheDocument();
    });

    test('should always render the main PayPal button even when the other buttons are blocked', async () => {
        render(
            <PayPalComponentV6 {...createProps({ blockPayPalPayLaterButton: true, blockPayPalCreditButton: true, blockPayPalVenmoButton: true })} />
        );

        expect(await screen.findByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-pay-later-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('venmo-button')).not.toBeInTheDocument();
    });

    test('should keep showing the loader when the SDK fails to load', async () => {
        const paypalService = mock<PayPalService>();
        paypalService.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));

        render(<PayPalComponentV6 {...createProps({ paypalService })} />);

        await waitFor(() => expect(paypalService.isSdkLoaded).toHaveBeenCalled());
        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-component')).not.toBeInTheDocument();
    });

    test('should render the processing spinner and hide the buttons when the status is set to processing', async () => {
        let componentRef: ComponentMethodsRef;
        const setComponentRef = jest.fn((ref: ComponentMethodsRef) => {
            componentRef = ref;
        });

        render(<PayPalComponentV6 {...createProps({ setComponentRef })} />);

        expect(await screen.findByTestId('paypal-component')).toBeInTheDocument();

        void act(() => {
            componentRef?.setStatus?.('processing' as UIElementStatus);
        });

        expect(screen.getByTestId('paypal-processing-spinner')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-component')).not.toBeInTheDocument();
        expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument();
    });

    test('should forward the commit flag to the processing spinner as the review page indicator', async () => {
        let componentRef: ComponentMethodsRef;
        const setComponentRef = jest.fn((ref: ComponentMethodsRef) => {
            componentRef = ref;
        });

        render(<PayPalComponentV6 {...createProps({ setComponentRef, commit: false })} />);

        expect(await screen.findByTestId('paypal-component')).toBeInTheDocument();

        void act(() => {
            componentRef?.setStatus?.('processing' as UIElementStatus);
        });

        expect(screen.getByTestId('paypal-processing-spinner')).toHaveAttribute('data-with-review-page', 'false');
    });
});
