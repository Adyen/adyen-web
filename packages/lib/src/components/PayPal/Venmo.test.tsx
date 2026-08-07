import { h } from 'preact';
import { render } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import Venmo from './Venmo';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { Resources } from '../../core/Context/Resources';
import { TxVariants } from '../tx-variants';
import { PayPalService } from './services/PayPalService';
import type { PayPalEligiblePaymentMethods } from './paypal-js-types';
import type { VenmoConfiguration } from './types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');

const mockVenmoComponent = jest.fn();
jest.mock('./components/VenmoComponent', () => ({
    VenmoComponent: (props: unknown) => {
        mockVenmoComponent(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;

const core = setupCoreMock();
const isEligibleMock = jest.fn();

const createElement = (props?: VenmoConfiguration) => new Venmo(core, { showPayButton: true, ...props });

describe('Venmo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        PayPalServiceMock.prototype.initialize.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.isSdkLoaded.mockResolvedValue(undefined);
        PayPalServiceMock.prototype.getEligiblePaymentMethods.mockReturnValue({
            isEligible: isEligibleMock
        } as unknown as PayPalEligiblePaymentMethods);
        isEligibleMock.mockReturnValue(true);
    });

    test('should be registered under the paypal_venmo tx variant', () => {
        expect(Venmo.type).toBe(TxVariants.paypal_venmo);
    });

    test('should load the venmo SDK component on top of the paypal one', () => {
        createElement();

        expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments', 'venmo-payments'] }));
    });

    test('should use the venmo icon', () => {
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        expect(createElement({ modules: { resources } }).icon).toBe('https://checkout-adyen.com/venmo');
    });

    test('should check the eligibility of the venmo funding source', async () => {
        await createElement().isAvailable();

        expect(isEligibleMock).toHaveBeenCalledWith('venmo');
    });

    test('should reject when venmo is not an eligible funding source', async () => {
        isEligibleMock.mockReturnValue(false);

        await expect(createElement().isAvailable()).rejects.toThrow('Venmo is not available');
    });

    test('should render the Venmo component with the payment options', () => {
        const element = createElement({ commit: false, vault: true, countryCode: 'US', presentationModeOptions: { presentationMode: 'popup' } });

        render(element.render());

        expect(mockVenmoComponent).toHaveBeenCalledWith(
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

        expect(mockVenmoComponent).not.toHaveBeenCalled();
    });

    test('should report a CANCEL error when the shopper cancels', () => {
        const onErrorMock = jest.fn();
        const element = createElement({ onError: onErrorMock });
        render(element.render());

        mockVenmoComponent.mock.calls[0][0].onCancel();

        expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ name: 'CANCEL' });
    });

    test('should report the error raised by the Venmo component', () => {
        const onErrorMock = jest.fn();
        const element = createElement({ onError: onErrorMock });
        render(element.render());

        const sdkError = new Error('Venmo session failed');
        mockVenmoComponent.mock.calls[0][0].onError(sdkError);

        expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Error: Venmo session failed', cause: sdkError });
    });
});
