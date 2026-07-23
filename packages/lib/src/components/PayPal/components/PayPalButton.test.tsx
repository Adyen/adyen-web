import { createRef, h } from 'preact';
import { render, fireEvent, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalButton } from './PayPalButton';
import { AmountProvider, AmountProviderRef } from '../../../core/Context/AmountProvider';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalEligiblePaymentMethods, PayPalSdkInstance } from '../paypal-js-types';
import type { PaymentAmount } from '../../../types';

const getWebComponent = (container: HTMLElement): HTMLElement =>
    // eslint-disable-next-line testing-library/no-node-access
    container.querySelector('paypal-button');

const createSessionMock = () => ({ start: jest.fn().mockResolvedValue(undefined) });

const setup = ({ isEligible = true, amount = { value: 1000, currency: 'USD' } }: { isEligible?: boolean; amount?: PaymentAmount } = {}) => {
    const oneTimeSession = createSessionMock();
    const saveSession = createSessionMock();

    const sdkInstance = {
        createPayPalOneTimePaymentSession: jest.fn().mockReturnValue(oneTimeSession),
        createPayPalSavePaymentSession: jest.fn().mockReturnValue(saveSession)
    } as unknown as PayPalSdkInstance;

    const isEligibleMock = jest.fn().mockReturnValue(isEligible);

    const paypalService = mock<PayPalService>();
    paypalService.getInstance.mockReturnValue(sdkInstance);
    paypalService.getEligiblePaymentMethods.mockReturnValue({ isEligible: isEligibleMock } as unknown as PayPalEligiblePaymentMethods);

    const props = {
        paypalService,
        commit: true,
        vault: false,
        style: { type: 'pay' as const, class: 'paypal-gold' as const },
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
            <PayPalButton {...props} />
        </AmountProvider>
    );

    return { ...view, sdkInstance, oneTimeSession, saveSession, isEligibleMock, props };
};

describe('PayPalButton', () => {
    test('should not render when the funding source is not eligible', () => {
        const { container } = setup({ isEligible: false });
        expect(getWebComponent(container as HTMLElement)).not.toBeInTheDocument();
    });

    test('should render the paypal-button web component with the provided style when eligible', async () => {
        const { container } = setup();

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        expect(getWebComponent(container as HTMLElement)).toHaveAttribute('type', 'pay');
        expect(getWebComponent(container as HTMLElement)).toHaveAttribute('class', 'paypal-gold');
    });

    test('should start a one-time payment session on click for a regular transaction', async () => {
        const { container, sdkInstance, oneTimeSession } = setup({ amount: { value: 1000, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        fireEvent.click(getWebComponent(container as HTMLElement));

        expect(sdkInstance.createPayPalOneTimePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(oneTimeSession.start).toHaveBeenCalled());
    });

    test('should start a save payment session on click for a zero-auth transaction', async () => {
        const { container, sdkInstance, saveSession } = setup({ amount: { value: 0, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        fireEvent.click(getWebComponent(container as HTMLElement));

        expect(sdkInstance.createPayPalSavePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(saveSession.start).toHaveBeenCalled());
    });
});
