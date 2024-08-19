import { h } from 'preact';
import { CardElement } from './Card';
import { render, screen } from '@testing-library/preact';
import CoreProvider from '../../core/Context/CoreProvider';
import Language from '../../language';
import { Resources } from '../../core/Context/Resources';

describe('Card', () => {
    describe('formatProps', function () {
        test('should not require a billingAddress if it is a stored card', () => {
            const card = new CardElement({ billingAddressRequired: true, storedPaymentMethodId: 'test' });
            expect(card.props.billingAddressRequired).toBe(false);
        });

        test('should format countryCode to lowerCase', () => {
            const card = new CardElement({ countryCode: 'KR' });
            expect(card.props.countryCode).toEqual('kr');
        });

        test('should return false for showStoreDetailsCheckbox in case of zero-auto transaction, whilst preserving the original value of enableStoreDetails', () => {
            const card = new CardElement({ amount: { value: 0 }, enableStoreDetails: true });
            expect(card.props.enableStoreDetails).toEqual(true);
            expect(card.props.showStoreDetailsCheckbox).toEqual(false);
        });
    });

    describe('payButton', () => {
        describe('Zero auth transaction', () => {
            const i18n = new Language();
            const props = { amount: { value: 0 }, enableStoreDetails: true, i18n };
            const customRender = (ui: h.JSX.Element) => {
                return render(
                    // @ts-ignore ignore
                    <CoreProvider i18n={i18n} loadingContext="test" resources={new Resources()}>
                        {ui}
                    </CoreProvider>
                );
            };

            test('should show the label "Save details" for the regular card', async () => {
                const card = new CardElement(props);
                // @ts-ignore ignore
                customRender(card.payButton());
                expect(await screen.findByRole('button', { name: 'Save details' })).toBeTruthy();
            });

            test('should show the label "Confirm preauthorization" for the stored card', async () => {
                const card = new CardElement({ ...props, storedPaymentMethodId: 'test' });
                // @ts-ignore ignore
                customRender(card.payButton());
                expect(await screen.findByRole('button', { name: 'Confirm preauthorization' })).toBeTruthy();
            });
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.card).toBe('123');
        });

        test('should return storePaymentMethod if enableStoreDetails is enabled', () => {
            const card = new CardElement({ enableStoreDetails: true });
            expect(card.props.showStoreDetailsCheckbox).toEqual(true);
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).toBe(true);
        });

        test('should not return storePaymentMethod if enableStoreDetails is disabled', () => {
            const card = new CardElement({ enableStoreDetails: false });
            expect(card.props.showStoreDetailsCheckbox).toEqual(false);
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).not.toBeDefined();
        });

        test('should only return storePaymentMethod:true for regular card, zero auth payments, *if* the conditions are right', () => {
            // Manual flow
            expect(new CardElement({ amount: { value: 0 }, enableStoreDetails: true }).data.storePaymentMethod).toBe(true);
            expect(new CardElement({ amount: { value: 0 }, enableStoreDetails: false }).data.storePaymentMethod).toBe(undefined);

            // Session flow - session configuration should override merchant configuration
            let cardElement = new CardElement({
                amount: { value: 0 },
                enableStoreDetails: false,
                session: { configuration: { enableStoreDetails: true } }
            });
            expect(cardElement.data.storePaymentMethod).toBe(true);

            cardElement = new CardElement({
                amount: { value: 0 },
                enableStoreDetails: true,
                session: { configuration: { enableStoreDetails: false } }
            });
            expect(cardElement.data.storePaymentMethod).toBe(undefined);
        });

        test('should return storePaymentMethod based on the checkbox value, for regular card, non-zero auth payments', () => {
            const card = new CardElement({ amount: { value: 10 }, enableStoreDetails: true });
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).toBe(true);
            card.setState({ storePaymentMethod: false });
            expect(card.data.storePaymentMethod).toBe(false);
        });

        test('should not return storePaymentMethod for stored card, non-zero auth payments', () => {
            expect(
                new CardElement({ amount: { value: 10 }, storedPaymentMethodId: 'xxx', enableStoreDetails: true }).data.storePaymentMethod
            ).not.toBeDefined();
            expect(
                new CardElement({ amount: { value: 10 }, storedPaymentMethodId: 'xxx', enableStoreDetails: false }).data.storePaymentMethod
            ).not.toBeDefined();
        });

        test('should not return storePaymentMethod for stored card, zero auth payments', () => {
            expect(
                new CardElement({ amount: { value: 0 }, storedPaymentMethodId: 'xxx', enableStoreDetails: true }).data.storePaymentMethod
            ).not.toBeDefined();
            expect(
                new CardElement({ amount: { value: 0 }, storedPaymentMethodId: 'xxx', enableStoreDetails: false }).data.storePaymentMethod
            ).not.toBeDefined();
        });
    });

    // describe('formatData', () => {
    //     test.only('should echo back holderName in storedPaymentMethods', () => {
    //         const i18n = global.i18n;
    //         const resources = global.resources;
    //         const srPanel = global.srPanel;

    //         const card = new CardElement({ loadingContext: 'test', i18n, modules: {resources, srPanel}, storedPaymentMethodId: 'xxx', holderName: 'Test Holder' });
    //         render(card.render());

    //         expect(card.formatData().paymentMethod).toContain('Test Holder');
    //     });
    // })

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const card = new CardElement({});
            expect(card.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            const card = new CardElement({});
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.isValid).toBe(true);
        });
    });

    describe('Test setting of configuration prop: koreanAuthenticationRequired', () => {
        test('Returns default value', () => {
            const card = new CardElement({ configuration: {} });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(undefined);
        });

        test('Returns configuration defined value', () => {
            const card = new CardElement({ configuration: { koreanAuthenticationRequired: true } });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(true);
        });

        test('Element has configuration object but value direct from props is ignored', () => {
            const card = new CardElement({ configuration: { koreanAuthenticationRequired: true }, koreanAuthenticationRequired: false });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(true);
        });

        test('Element has configuration object but value direct from props is ignored, inverse of last test', () => {
            const card = new CardElement({ configuration: { koreanAuthenticationRequired: false }, koreanAuthenticationRequired: true });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(false);
        });
    });
});
