import { h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PaypalCreditComponent } from './PaypalCreditComponent';
import type { PayPalComponentV6Props } from './types';
import type { PayPalService } from '../services/PayPalService';
import type { ComponentMethodsRef, UIElementStatus } from '../../types';

const mockPayPalCreditButton = jest.fn();
jest.mock('./PayPalCreditButton', () => ({
    PayPalCreditButton: (props: unknown) => {
        mockPayPalCreditButton(props);
        return <div data-testid="paypal-credit-button" />;
    }
}));
jest.mock('./PayPalProcessingSpinner', () => ({
    PayPalProcessingSpinner: ({ withoutReviewPage }: Readonly<{ withoutReviewPage: boolean }>) => (
        <div data-testid="paypal-processing-spinner" data-with-review-page={String(withoutReviewPage)} />
    )
}));

type PaypalCreditComponentProps = Omit<PayPalComponentV6Props, 'style'>;

const createProps = (overrides: Partial<PaypalCreditComponentProps> = {}): PaypalCreditComponentProps => {
    const paypalService = mock<PayPalService>();
    paypalService.isSdkLoaded.mockResolvedValue(undefined);

    return {
        paypalService,
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

const setStatusThroughRef = async (props: PaypalCreditComponentProps, status: UIElementStatus) => {
    const setComponentRef = props.setComponentRef as jest.Mock;
    const componentRef: ComponentMethodsRef = setComponentRef.mock.calls[0][0];
    await act(() => {
        componentRef.setStatus?.(status);
    });
};

describe('PaypalCreditComponent', () => {
    beforeEach(() => jest.clearAllMocks());

    test('should render the loader while the SDK is still loading', () => {
        const paypalService = mock<PayPalService>();
        // Never resolves, so the component stays in the pending state
        paypalService.isSdkLoaded.mockReturnValue(new Promise(() => {}));

        render(<PaypalCreditComponent {...createProps({ paypalService })} />);

        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-component')).not.toBeInTheDocument();
    });

    test('should render the credit button once the SDK is loaded', async () => {
        render(<PaypalCreditComponent {...createProps()} />);

        expect(await screen.findByTestId('paypal-credit-component')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-credit-button')).toBeInTheDocument();
    });

    test('should expose the component ref through setComponentRef on mount', () => {
        const props = createProps();
        render(<PaypalCreditComponent {...props} />);

        expect(props.setComponentRef).toHaveBeenCalledWith(expect.objectContaining({ setStatus: expect.any(Function) }));
    });

    test('should forward the payment options and the shipping callbacks to the credit button', async () => {
        const props = createProps({ commit: false, vault: true, presentationModeOptions: { presentationMode: 'popup' } });
        render(<PaypalCreditComponent {...props} />);

        await screen.findByTestId('paypal-credit-component');

        expect(mockPayPalCreditButton).toHaveBeenCalledWith(
            expect.objectContaining({
                paypalService: props.paypalService,
                commit: false,
                vault: true,
                presentationModeOptions: { presentationMode: 'popup' },
                onSubmit: props.onSubmit,
                onError: props.onError,
                onCancel: props.onCancel,
                onShippingAddressChange: props.onShippingAddressChange,
                onShippingOptionsChange: props.onShippingOptionsChange
            })
        );
    });

    test('should render the processing spinner and hide the button once the payment is approved', async () => {
        const props = createProps();
        render(<PaypalCreditComponent {...props} />);

        await screen.findByTestId('paypal-credit-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-button')).not.toBeInTheDocument();
    });

    test('should tell the processing spinner there is no review page when commit is false', async () => {
        const props = createProps({ commit: false });
        render(<PaypalCreditComponent {...props} />);

        await screen.findByTestId('paypal-credit-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toHaveAttribute('data-with-review-page', 'false');
    });

    test('should keep showing the loader when the SDK fails to load', async () => {
        const paypalService = mock<PayPalService>();
        paypalService.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));

        render(<PaypalCreditComponent {...createProps({ paypalService })} />);

        await waitFor(() => expect(paypalService.isSdkLoaded).toHaveBeenCalled());
        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-component')).not.toBeInTheDocument();
    });
});
