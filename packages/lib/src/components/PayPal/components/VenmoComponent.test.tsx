import { h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { VenmoComponent } from './VenmoComponent';
import type { PayPalComponentV6Props } from './types';
import type { PayPalService } from '../services/PayPalService';
import type { ComponentMethodsRef, UIElementStatus } from '../../types';

const mockVenmoButton = jest.fn();
jest.mock('./VenmoButton', () => ({
    VenmoButton: (props: unknown) => {
        mockVenmoButton(props);
        return <div data-testid="venmo-button" />;
    }
}));
jest.mock('./PayPalProcessingSpinner', () => ({
    PayPalProcessingSpinner: ({ withoutReviewPage }: Readonly<{ withoutReviewPage: boolean }>) => (
        <div data-testid="paypal-processing-spinner" data-with-review-page={String(withoutReviewPage)} />
    )
}));

type VenmoComponentProps = Omit<PayPalComponentV6Props, 'style' | 'onShippingAddressChange' | 'onShippingOptionsChange'>;

const createProps = (overrides: Partial<VenmoComponentProps> = {}): VenmoComponentProps => {
    const paypalService = mock<PayPalService>();
    paypalService.isSdkLoaded.mockResolvedValue(undefined);

    return {
        paypalService,
        commit: true,
        vault: false,
        onSubmit: jest.fn(),
        onApprove: jest.fn(),
        onCancel: jest.fn(),
        onError: jest.fn(),
        setComponentRef: jest.fn(),
        ...overrides
    };
};

const setStatusThroughRef = async (props: VenmoComponentProps, status: UIElementStatus) => {
    const setComponentRef = props.setComponentRef as jest.Mock;
    const componentRef: ComponentMethodsRef = setComponentRef.mock.calls[0][0];
    await act(() => {
        componentRef.setStatus?.(status);
    });
};

describe('VenmoComponent', () => {
    beforeEach(() => jest.clearAllMocks());

    test('should render the loader while the SDK is still loading', () => {
        const paypalService = mock<PayPalService>();
        // Never resolves, so the component stays in the pending state
        paypalService.isSdkLoaded.mockReturnValue(new Promise(() => {}));

        render(<VenmoComponent {...createProps({ paypalService })} />);

        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('venmo-component')).not.toBeInTheDocument();
    });

    test('should render the venmo button once the SDK is loaded', async () => {
        render(<VenmoComponent {...createProps()} />);

        expect(await screen.findByTestId('venmo-component')).toBeInTheDocument();
        expect(screen.getByTestId('venmo-button')).toBeInTheDocument();
    });

    test('should expose the component ref through setComponentRef on mount', () => {
        const props = createProps();
        render(<VenmoComponent {...props} />);

        expect(props.setComponentRef).toHaveBeenCalledWith(expect.objectContaining({ setStatus: expect.any(Function) }));
    });

    test('should forward the payment options to the venmo button', async () => {
        const props = createProps({ commit: false, vault: true, presentationModeOptions: { presentationMode: 'popup' } });
        render(<VenmoComponent {...props} style={{ type: 'pay', class: 'venmo-blue' }} />);

        await screen.findByTestId('venmo-component');

        expect(mockVenmoButton).toHaveBeenCalledWith(
            expect.objectContaining({
                paypalService: props.paypalService,
                commit: false,
                vault: true,
                presentationModeOptions: { presentationMode: 'popup' },
                style: { type: 'pay', class: 'venmo-blue' },
                onSubmit: props.onSubmit,
                onError: props.onError,
                onCancel: props.onCancel
            })
        );
    });

    test('should default the style to an empty object when the merchant does not provide one', async () => {
        render(<VenmoComponent {...createProps()} />);

        await screen.findByTestId('venmo-component');

        expect(mockVenmoButton).toHaveBeenCalledWith(expect.objectContaining({ style: {} }));
    });

    test('should render the processing spinner and hide the button once the payment is approved', async () => {
        const props = createProps();
        render(<VenmoComponent {...props} />);

        await screen.findByTestId('venmo-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toBeInTheDocument();
        expect(screen.queryByTestId('venmo-button')).not.toBeInTheDocument();
    });

    test('should tell the processing spinner there is no review page when commit is false', async () => {
        const props = createProps({ commit: false });
        render(<VenmoComponent {...props} />);

        await screen.findByTestId('venmo-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toHaveAttribute('data-with-review-page', 'false');
    });

    test('should keep showing the loader when the SDK fails to load', async () => {
        const paypalService = mock<PayPalService>();
        paypalService.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));

        render(<VenmoComponent {...createProps({ paypalService })} />);

        await waitFor(() => expect(paypalService.isSdkLoaded).toHaveBeenCalled());
        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('venmo-component')).not.toBeInTheDocument();
    });
});
