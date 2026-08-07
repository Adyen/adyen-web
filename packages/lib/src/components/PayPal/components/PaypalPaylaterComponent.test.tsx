import { h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalPaylaterComponent } from './PaypalPaylaterComponent';
import type { PayPalComponentV6Props } from './types';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalFetchContentOptions } from '../paypal-js-types';
import type { ComponentMethodsRef, UIElementStatus } from '../../types';

const mockPayPalPayLaterButton = jest.fn();
const mockPayPalMessaging = jest.fn();

jest.mock('./PayPalPayLaterButton', () => ({
    PayPalPayLaterButton: (props: unknown) => {
        mockPayPalPayLaterButton(props);
        return <div data-testid="paypal-pay-later-button" />;
    }
}));
jest.mock('./PayPalMessaging', () => ({
    PayPalMessaging: (props: unknown) => {
        mockPayPalMessaging(props);
        return <div data-testid="paypal-messaging" />;
    }
}));
jest.mock('./PayPalProcessingSpinner', () => ({
    PayPalProcessingSpinner: ({ withoutReviewPage }: Readonly<{ withoutReviewPage: boolean }>) => (
        <div data-testid="paypal-processing-spinner" data-with-review-page={String(withoutReviewPage)} />
    )
}));

type PayPalPaylaterComponentProps = Omit<PayPalComponentV6Props, 'style' | 'vault'> & {
    hidePayPalMessaging?: boolean;
    countryCode?: string;
    messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
};

const createProps = (overrides: Partial<PayPalPaylaterComponentProps> = {}): PayPalPaylaterComponentProps => {
    const paypalService = mock<PayPalService>();
    paypalService.isSdkLoaded.mockResolvedValue(undefined);

    return {
        paypalService,
        commit: true,
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

const setStatusThroughRef = async (props: PayPalPaylaterComponentProps, status: UIElementStatus) => {
    const setComponentRef = props.setComponentRef as jest.Mock;
    const componentRef: ComponentMethodsRef = setComponentRef.mock.calls[0][0];
    await act(() => {
        componentRef.setStatus?.(status);
    });
};

describe('PayPalPaylaterComponent', () => {
    beforeEach(() => jest.clearAllMocks());

    test('should render the loader while the SDK is still loading', () => {
        const paypalService = mock<PayPalService>();
        // Never resolves, so the component stays in the pending state
        paypalService.isSdkLoaded.mockReturnValue(new Promise(() => {}));

        render(<PayPalPaylaterComponent {...createProps({ paypalService })} />);

        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-paylater-component')).not.toBeInTheDocument();
    });

    test('should render the messaging and the pay later button once the SDK is loaded', async () => {
        render(<PayPalPaylaterComponent {...createProps()} />);

        expect(await screen.findByTestId('paypal-paylater-component')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-messaging')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-pay-later-button')).toBeInTheDocument();
    });

    test('should not render the messaging when it is hidden by the merchant', async () => {
        render(<PayPalPaylaterComponent {...createProps({ hidePayPalMessaging: true })} />);

        expect(await screen.findByTestId('paypal-paylater-component')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-messaging')).not.toBeInTheDocument();
        expect(screen.getByTestId('paypal-pay-later-button')).toBeInTheDocument();
    });

    test('should expose the component ref through setComponentRef on mount', () => {
        const props = createProps();
        render(<PayPalPaylaterComponent {...props} />);

        expect(props.setComponentRef).toHaveBeenCalledWith(expect.objectContaining({ setStatus: expect.any(Function) }));
    });

    test('should forward the country code and the content options to the messaging', async () => {
        const messagingContentOptions = { logoType: 'WORDMARK', logoPosition: 'TOP', textColor: 'WHITE' } as const;
        const props = createProps({ countryCode: 'US', messagingContentOptions });
        render(<PayPalPaylaterComponent {...props} />);

        await screen.findByTestId('paypal-paylater-component');

        expect(mockPayPalMessaging).toHaveBeenCalledWith(
            expect.objectContaining({ paypalService: props.paypalService, countryCode: 'US', messagingContentOptions })
        );
    });

    test('should forward the payment options and the shipping callbacks to the pay later button', async () => {
        const props = createProps({ commit: false, presentationModeOptions: { presentationMode: 'popup' } });
        render(<PayPalPaylaterComponent {...props} />);

        await screen.findByTestId('paypal-paylater-component');

        expect(mockPayPalPayLaterButton).toHaveBeenCalledWith(
            expect.objectContaining({
                paypalService: props.paypalService,
                commit: false,
                presentationModeOptions: { presentationMode: 'popup' },
                onSubmit: props.onSubmit,
                onError: props.onError,
                onCancel: props.onCancel,
                onShippingAddressChange: props.onShippingAddressChange,
                onShippingOptionsChange: props.onShippingOptionsChange
            })
        );
    });

    test('should render the processing spinner and hide the messaging and button once the payment is approved', async () => {
        const props = createProps();
        render(<PayPalPaylaterComponent {...props} />);

        await screen.findByTestId('paypal-paylater-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-messaging')).not.toBeInTheDocument();
        expect(screen.queryByTestId('paypal-pay-later-button')).not.toBeInTheDocument();
    });

    test('should tell the processing spinner there is no review page when commit is false', async () => {
        const props = createProps({ commit: false });
        render(<PayPalPaylaterComponent {...props} />);

        await screen.findByTestId('paypal-paylater-component');

        await setStatusThroughRef(props, 'processing' as UIElementStatus);

        expect(screen.getByTestId('paypal-processing-spinner')).toHaveAttribute('data-with-review-page', 'false');
    });

    test('should keep showing the loader when the SDK fails to load', async () => {
        const paypalService = mock<PayPalService>();
        paypalService.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));

        render(<PayPalPaylaterComponent {...createProps({ paypalService })} />);

        await waitFor(() => expect(paypalService.isSdkLoaded).toHaveBeenCalled());
        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-paylater-component')).not.toBeInTheDocument();
    });
});
