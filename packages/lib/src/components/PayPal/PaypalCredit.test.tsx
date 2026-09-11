import { h } from 'preact';
import { render } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import PaypalCredit from './PaypalCredit';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { Resources } from '../../core/Context/Resources';
import { TxVariants } from '../tx-variants';
import { PayPalService } from './services/PayPalService';
import type { PayPalEligiblePaymentMethods } from './paypal-js-types';
import type { BasePayPalConfiguration } from './types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');

const mockPaypalCreditComponent = jest.fn();
jest.mock('./components/PaypalCreditComponent', () => ({
    PaypalCreditComponent: (props: unknown) => {
        mockPaypalCreditComponent(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;

const core = setupCoreMock();
const isEligibleMock = jest.fn();

const createElement = (props?: BasePayPalConfiguration) => new PaypalCredit(core, { showPayButton: true, ...props });

describe('PaypalCredit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        PayPalServiceMock.prototype.initialize.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.isSdkLoaded.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.getEligiblePaymentMethods.mockReturnValue({
            isEligible: isEligibleMock
        } as unknown as PayPalEligiblePaymentMethods);
        isEligibleMock.mockReturnValue(true);
    });

    test('should be registered under the paypal_credit tx variant', () => {
        expect(PaypalCredit.type).toBe(TxVariants.paypal_credit);
    });

    test('should only load the paypal SDK component', () => {
        createElement();

        expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments'] }));
    });

    test('should reuse the paypal icon', () => {
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        expect(createElement({ modules: { resources } }).icon).toBe(`https://checkout-adyen.com/${TxVariants.paypal}`);
    });

    test('should check the eligibility of the credit funding source', async () => {
        await createElement().isAvailable();

        expect(isEligibleMock).toHaveBeenCalledWith('credit');
    });

    test('should reject when credit is not an eligible funding source', async () => {
        isEligibleMock.mockReturnValue(false);

        await expect(createElement().isAvailable()).rejects.toThrow('PayPalCredit is not available');
    });

    test('should render the PaypalCredit component with the payment options', () => {
        const element = createElement({ commit: false, vault: true, countryCode: 'US', presentationModeOptions: { presentationMode: 'popup' } });

        render(element.render());

        expect(mockPaypalCreditComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                commit: false,
                vault: true,
                countryCode: 'US',
                presentationModeOptions: { presentationMode: 'popup' },
                paypalService: expect.any(PayPalService),
                setComponentRef: expect.any(Function),
                onSubmit: expect.any(Function),
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function)
            })
        );
    });

    test('should not render anything when showPayButton is false', () => {
        const element = createElement({ showPayButton: false });

        render(element.render());

        expect(mockPaypalCreditComponent).not.toHaveBeenCalled();
    });

    test('should not pass the shipping handlers when the merchant did not provide the callbacks', () => {
        render(createElement().render());

        const props = mockPaypalCreditComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toBeUndefined();
        expect(props.onShippingOptionsChange).toBeUndefined();
    });

    test('should pass the shipping handlers when the merchant provided the callbacks', () => {
        render(createElement({ onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() }).render());

        const props = mockPaypalCreditComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toEqual(expect.any(Function));
        expect(props.onShippingOptionsChange).toEqual(expect.any(Function));
    });

    test('should report a CANCEL error when the shopper cancels', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        mockPaypalCreditComponent.mock.calls[0][0].onCancel();

        expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ name: 'CANCEL' });
    });

    test('should report the error raised by the PaypalCredit component', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        const sdkError = new Error('Credit session failed');
        mockPaypalCreditComponent.mock.calls[0][0].onError(sdkError);

        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Error: Credit session failed', cause: sdkError });
    });
});
