import { h } from 'preact';
import { render } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import PaypalPaylater from './PaypalPaylater';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { Resources } from '../../core/Context/Resources';
import { TxVariants } from '../tx-variants';
import { PayPalService } from './services/PayPalService';
import type { PayPalEligiblePaymentMethods } from './paypal-js-types';
import type { PayPalPayLaterConfiguration } from './types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');

const mockPayPalPaylaterComponent = jest.fn();
jest.mock('./components/PaypalPaylaterComponent', () => ({
    PayPalPaylaterComponent: (props: unknown) => {
        mockPayPalPaylaterComponent(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;

const core = setupCoreMock();
const isEligibleMock = jest.fn();

const createElement = (props?: PayPalPayLaterConfiguration) => new PaypalPaylater(core, { showPayButton: true, ...props });

describe('PaypalPaylater', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        PayPalServiceMock.prototype.initialize.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.isSdkLoaded.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.getEligiblePaymentMethods.mockReturnValue({
            isEligible: isEligibleMock
        } as unknown as PayPalEligiblePaymentMethods);
        isEligibleMock.mockReturnValue(true);
    });

    test('should be registered under the paypal_paylater tx variant', () => {
        expect(PaypalPaylater.type).toBe(TxVariants.paypal_paylater);
    });

    test('should load the messages SDK component on top of the paypal one', () => {
        createElement();

        expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments', 'paypal-messages'] }));
    });

    test('should reuse the paypal icon', () => {
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        expect(createElement({ modules: { resources } }).icon).toBe(`https://checkout-adyen.com/${TxVariants.paypal}`);
    });

    test('should check the eligibility of the paylater funding source', async () => {
        await createElement().isAvailable();

        expect(isEligibleMock).toHaveBeenCalledWith('paylater');
    });

    test('should reject when paylater is not an eligible funding source', async () => {
        isEligibleMock.mockReturnValue(false);

        await expect(createElement().isAvailable()).rejects.toThrow('PayPalPaylater is not available');
    });

    test('should render the PayPalPaylater component with the payment and messaging options', () => {
        const messagingContentOptions = { logoType: 'WORDMARK', logoPosition: 'TOP', textColor: 'WHITE' } as const;
        const element = createElement({
            commit: false,
            countryCode: 'US',
            hidePayPalMessaging: true,
            messagingContentOptions,
            presentationModeOptions: { presentationMode: 'popup' }
        });

        render(element.render());

        expect(mockPayPalPaylaterComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                commit: false,
                countryCode: 'US',
                hidePayPalMessaging: true,
                messagingContentOptions,
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

        expect(mockPayPalPaylaterComponent).not.toHaveBeenCalled();
    });

    test('should not pass the shipping handlers when the merchant did not provide the callbacks', () => {
        render(createElement().render());

        const props = mockPayPalPaylaterComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toBeUndefined();
        expect(props.onShippingOptionsChange).toBeUndefined();
    });

    test('should pass the shipping handlers when the merchant provided the callbacks', () => {
        render(createElement({ onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() }).render());

        const props = mockPayPalPaylaterComponent.mock.calls[0][0];
        expect(props.onShippingAddressChange).toEqual(expect.any(Function));
        expect(props.onShippingOptionsChange).toEqual(expect.any(Function));
    });

    test('should report a CANCEL error when the shopper cancels', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        mockPayPalPaylaterComponent.mock.calls[0][0].onCancel();

        expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ name: 'CANCEL' });
    });

    test('should report the error raised by the PayPalPaylater component', () => {
        const onErrorMock = jest.fn();
        render(createElement({ onError: onErrorMock }).render());

        const sdkError = new Error('Pay later session failed');
        mockPayPalPaylaterComponent.mock.calls[0][0].onError(sdkError);

        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Error: Pay later session failed', cause: sdkError });
    });
});
