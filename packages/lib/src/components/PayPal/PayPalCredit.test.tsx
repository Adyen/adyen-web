import { h } from 'preact';
import { render } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import PayPalCredit from './PayPalCredit';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { Resources } from '../../core/Context/Resources';
import { TxVariants } from '../tx-variants';
import { PayPalService } from './services/PayPalService';
import type { PayPalEligiblePaymentMethods } from './paypal-js-types';
import type { BasePayPalConfiguration } from './types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');

const mockPayPalCreditComponent = jest.fn();
jest.mock('./components/PayPalCreditComponent', () => ({
    PayPalCreditComponent: (props: unknown) => {
        mockPayPalCreditComponent(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;

const core = setupCoreMock();
const isEligibleMock = jest.fn();

const createElement = (props?: BasePayPalConfiguration) => new PayPalCredit(core, props);

describe('PayPalCredit', () => {
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
        expect(PayPalCredit.type).toBe(TxVariants.paypal_credit);
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

    test('should render the PayPalCredit component with the payment options', () => {
        const element = createElement({ commit: false, vault: true, countryCode: 'US', presentationModeOptions: { presentationMode: 'popup' } });

        render(element.render());

        expect(mockPayPalCreditComponent).toHaveBeenCalledWith(
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

    test('should render even when showPayButton is false', () => {
        const element = createElement({ showPayButton: false });

        render(element.render());

        expect(mockPayPalCreditComponent).toHaveBeenCalled();
    });

    test('should not pass the shipping handlers when the merchant did not provide the callbacks', () => {
        render(createElement().render());

        const props = mockPayPalCreditComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toBeUndefined();
        expect(props.onShippingOptionsChange).toBeUndefined();
    });

    test('should pass the shipping handlers when the merchant provided the callbacks', () => {
        render(createElement({ isExpress: true, onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() }).render());

        const props = mockPayPalCreditComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toEqual(expect.any(Function));
        expect(props.onShippingOptionsChange).toEqual(expect.any(Function));
    });

    test('should report a CANCEL error when the shopper cancels', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        mockPayPalCreditComponent.mock.calls[0][0].onCancel();

        expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ name: 'CANCEL' });
    });

    test('should report the error raised by the PayPalCredit component', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        const sdkError = new Error('Credit session failed');
        mockPayPalCreditComponent.mock.calls[0][0].onError(sdkError);

        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Error: Credit session failed', cause: sdkError });
    });
});
