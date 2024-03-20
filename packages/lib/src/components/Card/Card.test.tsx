import { h } from 'preact';
import { CardElement } from './Card';
import { render, screen } from '@testing-library/preact';
import CoreProvider from '../../core/Context/CoreProvider';
import { Resources } from '../../core/Context/Resources';

describe('Card', () => {
    describe('formatProps', function () {
        test('should not require a billingAddress if it is a stored card', () => {
            const card = new CardElement(global.core, {
                billingAddressRequired: true,
                storedPaymentMethodId: 'test',
                supportedShopperInteractions: ['Ecommerce']
            });
            expect(card.props.billingAddressRequired).toBe(false);
            expect(card.props.type).toEqual('scheme');
        });

        test('should format countryCode to lowerCase', () => {
            const card = new CardElement(global.core, { countryCode: 'KR' });
            expect(card.props.countryCode).toEqual('kr');
        });

        test('should return false for showStoreDetailsCheckbox in case of zero-auto transaction, whilst preserving the original value of enableStoreDetail', () => {
            const card = new CardElement(global.core, { amount: { value: 0, currency: 'eur' }, enableStoreDetails: true });
            expect(card.props.enableStoreDetails).toEqual(true);
            expect(card.props.showStoreDetailsCheckbox).toEqual(false);
        });
    });

    describe('payButton', () => {
        describe('Zero auth transaction', () => {
            const props = { amount: { value: 0, currency: 'eur' }, enableStoreDetails: true, i18n: global.i18n };
            const customRender = (ui: h.JSX.Element) => {
                return render(
                    // @ts-ignore ignore
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={new Resources()}>
                        {ui}
                    </CoreProvider>
                );
            };

            test('should show the label "Save details" for the regular card', async () => {
                const card = new CardElement(global.core, props);
                // @ts-ignore ignore
                customRender(card.payButton());
                expect(await screen.findByRole('button', { name: 'Save details' })).toBeTruthy();
            });

            test('should show the label "Confirm preauthorization" for the stored card', async () => {
                const card = new CardElement(global.core, { ...props, storedPaymentMethodId: 'test', supportedShopperInteractions: ['Ecommerce'] });
                // @ts-ignore ignore
                customRender(card.payButton());
                expect(await screen.findByRole('button', { name: 'Confirm preauthorization' })).toBeTruthy();
            });
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const card = new CardElement(global.core);
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            const card = new CardElement(global.core);
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.card).toBe('123');
        });

        test('should return storePaymentMethod if enableStoreDetails is enabled', () => {
            const card = new CardElement(global.core, { enableStoreDetails: true });
            expect(card.props.showStoreDetailsCheckbox).toEqual(true);
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).toBe(true);
        });

        test('should not return storePaymentMethod if enableStoreDetails is disabled', () => {
            const card = new CardElement(global.core, { enableStoreDetails: false });
            expect(card.props.showStoreDetailsCheckbox).toEqual(false);
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).not.toBeDefined();
        });

        test('should only return storePaymentMethod:true for regular card, zero auth payments, *if* the conditions are right', () => {
            // Manual flow
            expect(new CardElement(global.core, { amount: { value: 0, currency: 'USD' }, enableStoreDetails: true }).data.storePaymentMethod).toBe(
                true
            );
            expect(new CardElement(global.core, { amount: { value: 0, currency: 'USD' }, enableStoreDetails: false }).data.storePaymentMethod).toBe(
                undefined
            );

            // Session flow - session configuration should override merchant configuration
            let cardElement = new CardElement(global.core, {
                amount: { value: 0, currency: 'USD' },
                enableStoreDetails: false,
                // @ts-ignore it's just a test
                session: { configuration: { enableStoreDetails: true } }
            });
            expect(cardElement.data.storePaymentMethod).toBe(true);

            cardElement = new CardElement(global.core, {
                amount: { value: 0, currency: 'USD' },
                enableStoreDetails: true,
                // @ts-ignore it's just a test
                session: { configuration: { enableStoreDetails: false } }
            });
            expect(cardElement.data.storePaymentMethod).toBe(undefined);
        });

        test('should return storePaymentMethod based on the checkbox value, for regular card, non-zero auth payments', () => {
            const card = new CardElement(global.core, { amount: { value: 10, currency: 'USD' }, enableStoreDetails: true });
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).toBe(true);
            card.setState({ storePaymentMethod: false });
            expect(card.data.storePaymentMethod).toBe(false);
        });

        test('should not return storePaymentMethod for stored card, non-zero auth payments', () => {
            expect(
                new CardElement(global.core, {
                    amount: { value: 10, currency: 'USD' },
                    storedPaymentMethodId: 'xxx',
                    supportedShopperInteractions: ['Ecommerce'],
                    enableStoreDetails: true
                }).data.storePaymentMethod
            ).not.toBeDefined();
            expect(
                new CardElement(global.core, {
                    amount: { value: 10, currency: 'USD' },
                    storedPaymentMethodId: 'xxx',
                    supportedShopperInteractions: ['Ecommerce'],
                    enableStoreDetails: false
                }).data.storePaymentMethod
            ).not.toBeDefined();
        });

        test('should not return storePaymentMethod for stored card, zero auth payments', () => {
            expect(
                new CardElement(global.core, {
                    amount: { value: 0, currency: 'USD' },
                    storedPaymentMethodId: 'xxx',
                    supportedShopperInteractions: ['Ecommerce'],
                    enableStoreDetails: true
                }).data.storePaymentMethod
            ).not.toBeDefined();
            expect(
                new CardElement(global.core, {
                    amount: { value: 0, currency: 'USD' },
                    storedPaymentMethodId: 'xxx',
                    supportedShopperInteractions: ['Ecommerce'],
                    enableStoreDetails: false
                }).data.storePaymentMethod
            ).not.toBeDefined();
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const card = new CardElement(global.core);
            expect(card.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            const card = new CardElement(global.core);
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.isValid).toBe(true);
        });
    });

    describe('Test setting of configuration prop: koreanAuthenticationRequired', () => {
        test('Returns default value', () => {
            const card = new CardElement(global.core, { configuration: {} });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(undefined);
        });

        test('Returns configuration defined value', () => {
            const card = new CardElement(global.core, { configuration: { koreanAuthenticationRequired: true } });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(true);
        });
    });

    describe('Test creating storedCard with regular, processed, stored card data', () => {
        const regularStoredCardData = {
            brand: 'mc',
            expiryMonth: '03',
            expiryYear: '30',
            holderName: 'Checkout Shopper PlaceHolder',
            id: 'MUC44SHNG3M84H82',
            lastFour: '4444',
            name: 'MasterCard',
            networkTxReference: 'JP9WCB2',
            supportedRecurringProcessingModels: ['CardOnFile', 'Subscription', 'UnscheduledCardOnFile'],
            supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
            type: 'scheme',
            storedPaymentMethodId: 'MUC44SHNG3M84H82',
            isStoredPaymentMethod: true
        };

        test('Creates storedCard', () => {
            const card = new CardElement(global.core, { ...regularStoredCardData });
            expect(card.props).not.toBe(undefined);
            expect(card.props.storedPaymentMethodId).toEqual('MUC44SHNG3M84H82');
        });
    });

    describe('Test creating storedCard with raw stored card data direct from the paymentMethodsResponse', () => {
        const rawStoredCardData = {
            brand: 'mc',
            expiryMonth: '03',
            expiryYear: '30',
            holderName: 'Checkout Shopper PlaceHolder',
            id: 'TBD44SHNG3M84H82',
            lastFour: '4444',
            name: 'MasterCard',
            networkTxReference: 'JP9WCB2M',
            supportedRecurringProcessingModels: ['CardOnFile', 'Subscription', 'UnscheduledCardOnFile'],
            supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
            type: 'scheme'
        };

        test('Creates storedCard from raw storedCardData, generating a storedPaymentMethodId along the way', () => {
            const card = new CardElement(global.core, { ...rawStoredCardData });
            expect(card.props).not.toBe(undefined);
            expect(card.props.storedPaymentMethodId).toEqual('TBD44SHNG3M84H82');
        });

        test('Fails to create storedCard from raw storedCardData since card does not support "Ecommerce"', () => {
            rawStoredCardData.supportedShopperInteractions = ['ContAuth'];
            expect(() => {
                new CardElement(global.core, { ...rawStoredCardData });
            }).toThrow('You are trying to create a storedCard from a stored PM that does not support Ecommerce interactions');
        });

        test('Creates storedCard when cardData has no storedPaymentMethodId (which will actually result in rendering a regular card)', () => {
            delete rawStoredCardData.id;
            const card = new CardElement(global.core, { ...rawStoredCardData });
            expect(card.props).not.toBe(undefined);
            expect(card.props.storedPaymentMethodId).toBe(undefined);
        });
    });
});
