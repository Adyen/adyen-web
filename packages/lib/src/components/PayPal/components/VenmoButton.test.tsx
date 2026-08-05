import { createRef, h } from 'preact';
import { render, fireEvent, waitFor, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { VenmoButton } from './VenmoButton';
import { AmountProvider, AmountProviderRef } from '../../../core/Context/AmountProvider';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalEligiblePaymentMethods, PayPalSdkInstance } from '../paypal-js-types';
import type { PaymentAmount } from '../../../types';

const getWebComponent = () => screen.getByTestId('venmo-button');
const queryWebComponent = () => screen.queryByTestId('venmo-button');

const createSessionMock = () => ({ start: jest.fn().mockResolvedValue(undefined) });

const setup = ({ isEligible = true, amount = { value: 1000, currency: 'USD' } }: { isEligible?: boolean; amount?: PaymentAmount } = {}) => {
    const oneTimeSession = createSessionMock();
    const saveSession = createSessionMock();

    const sdkInstance = {
        createVenmoOneTimePaymentSession: jest.fn().mockReturnValue(oneTimeSession),
        createVenmoSavePaymentSession: jest.fn().mockReturnValue(saveSession)
    } as unknown as PayPalSdkInstance;

    const isEligibleMock = jest.fn().mockReturnValue(isEligible);

    const paypalService = mock<PayPalService>();
    paypalService.getInstance.mockReturnValue(sdkInstance);
    paypalService.getEligiblePaymentMethods.mockReturnValue({ isEligible: isEligibleMock } as unknown as PayPalEligiblePaymentMethods);

    const props = {
        paypalService,
        commit: true,
        vault: false,
        style: { type: 'pay' as const, class: 'venmo-blue' as const },
        onApprove: jest.fn(),
        onShippingAddressChange: jest.fn(),
        onShippingOptionsChange: jest.fn(),
        onCancel: jest.fn(),
        onError: jest.fn(),
        onSubmit: jest.fn().mockResolvedValue('order-1')
    };

    const providerRef = createRef<AmountProviderRef>();
    const view = render(
        <AmountProvider amount={amount} providerRef={providerRef}>
            <VenmoButton {...props} />
        </AmountProvider>
    );

    return { ...view, sdkInstance, oneTimeSession, saveSession, isEligibleMock, props };
};

describe('VenmoButton', () => {
    test('should not render when the funding source is not eligible', () => {
        setup({ isEligible: false });
        expect(queryWebComponent()).not.toBeInTheDocument();
    });

    test('should render the venmo-button web component with the provided style when eligible', async () => {
        setup();

        await waitFor(() => expect(getWebComponent()).toBeInTheDocument());
        expect(getWebComponent()).toHaveAttribute('type', 'pay');
        expect(getWebComponent()).toHaveAttribute('class', 'venmo-blue');
    });

    test('should start a one-time payment session on click for a regular transaction', async () => {
        const { sdkInstance, oneTimeSession } = setup({ amount: { value: 1000, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent()).toBeInTheDocument());
        fireEvent.click(getWebComponent());

        expect(sdkInstance.createVenmoOneTimePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(oneTimeSession.start).toHaveBeenCalled());
    });

    test('should start a save payment session on click for a zero-auth transaction', async () => {
        const { sdkInstance, saveSession } = setup({ amount: { value: 0, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent()).toBeInTheDocument());
        fireEvent.click(getWebComponent());

        expect(sdkInstance.createVenmoSavePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(saveSession.start).toHaveBeenCalled());
    });
});
