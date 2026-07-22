import { createRef, h } from 'preact';
import { render, fireEvent, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalCreditButton } from './PayPalCreditButton';
import { AmountProvider, AmountProviderRef } from '../../../core/Context/AmountProvider';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalSdkInstance } from '../paypal-js-types';
import type { PaymentAmount } from '../../../types';

const getWebComponent = (container: HTMLElement): HTMLElement =>
    // eslint-disable-next-line testing-library/no-node-access
    container.querySelector('paypal-credit-button');

const createSessionMock = () => ({ start: jest.fn().mockResolvedValue(undefined) });

const setup = ({ isEligible = true, amount = { value: 1000, currency: 'USD' } }: { isEligible?: boolean; amount?: PaymentAmount } = {}) => {
    const oneTimeSession = createSessionMock();
    const saveSession = createSessionMock();

    const sdkInstance = {
        createPayPalCreditOneTimePaymentSession: jest.fn().mockReturnValue(oneTimeSession),
        createPayPalCreditSavePaymentSession: jest.fn().mockReturnValue(saveSession)
    } as unknown as PayPalSdkInstance;

    const isEligibleMock = jest.fn().mockReturnValue(isEligible);
    const getDetailsMock = jest.fn().mockReturnValue({ countryCode: 'US' });

    const paypalService = mock<PayPalService>();
    paypalService.getInstance.mockReturnValue(sdkInstance);
    paypalService.getEligiblePaymentMethods.mockReturnValue({
        isEligible: isEligibleMock,
        getDetails: getDetailsMock
    });

    const props = {
        paypalService,
        commit: true,
        vault: false,
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
            <PayPalCreditButton {...props} />
        </AmountProvider>
    );

    return { ...view, sdkInstance, oneTimeSession, saveSession, isEligibleMock, getDetailsMock, props };
};

describe('PayPalCreditButton', () => {
    test('should not render when the funding source is not eligible', () => {
        const { container } = setup({ isEligible: false });
        expect(getWebComponent(container as HTMLElement)).not.toBeInTheDocument();
    });

    test('should render the paypal-credit-button web component when eligible', async () => {
        const { container } = setup();
        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
    });

    test('should set the countryCode attribute from the eligible method details', async () => {
        const { container, getDetailsMock } = setup();

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toHaveAttribute('countryCode', 'US'));
        expect(getDetailsMock).toHaveBeenCalledWith('credit');
    });

    test('should start a one-time payment session on click for a regular transaction', async () => {
        const { container, sdkInstance, oneTimeSession } = setup({ amount: { value: 1000, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        fireEvent.click(getWebComponent(container as HTMLElement));

        expect(sdkInstance.createPayPalCreditOneTimePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(oneTimeSession.start).toHaveBeenCalled());
    });

    test('should start a save payment session on click for a zero-auth transaction', async () => {
        const { container, sdkInstance, saveSession } = setup({ amount: { value: 0, currency: 'USD' } });

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        fireEvent.click(getWebComponent(container as HTMLElement));

        expect(sdkInstance.createPayPalCreditSavePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(saveSession.start).toHaveBeenCalled());
    });
});
