import { h } from 'preact';
import { render, fireEvent, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalSdkInstance } from '../paypal-js-types';

const getWebComponent = (container: HTMLElement): HTMLElement =>
    // eslint-disable-next-line testing-library/no-node-access
    container.querySelector('paypal-pay-later-button');

const createSessionMock = () => ({ start: jest.fn().mockResolvedValue(undefined) });

const setup = ({ isEligible = true } = {}) => {
    const oneTimeSession = createSessionMock();

    const sdkInstance = {
        createPayLaterOneTimePaymentSession: jest.fn().mockReturnValue(oneTimeSession)
    } as unknown as PayPalSdkInstance;

    const isEligibleMock = jest.fn().mockReturnValue(isEligible);
    const getDetailsMock = jest.fn().mockReturnValue({ productCode: 'PAY_LATER_SHORT_TERM', countryCode: 'US' });

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

    const view = render(<PayPalPayLaterButton {...props} />);

    return { ...view, sdkInstance, oneTimeSession, isEligibleMock, getDetailsMock, props };
};

describe('PayPalPayLaterButton', () => {
    test('should not render when the funding source is not eligible', () => {
        const { container } = setup({ isEligible: false });
        expect(getWebComponent(container as HTMLElement)).not.toBeInTheDocument();
    });

    test('should render the paypal-pay-later-button web component when eligible', async () => {
        const { container } = setup();
        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
    });

    test('should set the productCode attribute from the eligible method details', async () => {
        const { container, getDetailsMock } = setup();

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toHaveAttribute('productCode', 'PAY_LATER_SHORT_TERM'));
        expect(getDetailsMock).toHaveBeenCalledWith('paylater');
    });

    test('should set the countryCode attribute from the eligible method details', async () => {
        const { container } = setup();

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toHaveAttribute('countryCode', 'US'));
    });

    test('should start a one-time payment session on click', async () => {
        const { container, sdkInstance, oneTimeSession } = setup();

        await waitFor(() => expect(getWebComponent(container as HTMLElement)).toBeInTheDocument());
        fireEvent.click(getWebComponent(container as HTMLElement));

        expect(sdkInstance.createPayLaterOneTimePaymentSession).toHaveBeenCalled();
        await waitFor(() => expect(oneTimeSession.start).toHaveBeenCalled());
    });
});
