import { h } from 'preact';
import { CardElement } from './Card';
import { render, screen } from '@testing-library/preact';
import CoreProvider from '../../core/Context/CoreProvider';
import Language from '../../language';
import { Resources } from '../../core/Context/Resources';

describe('Card', () => {
    describe('formatProps', function () {
        test('should not require a billingAddress if it is a stored card', () => {
            const card = new CardElement({ core: global.core, billingAddressRequired: true, storedPaymentMethodId: 'test' });
            expect(card.props.billingAddressRequired).toBe(false);
            expect(card.props.type).toEqual('scheme');
        });

        test('should format countryCode to lowerCase', () => {
            const card = new CardElement({ core: global.core, countryCode: 'KR' });
            expect(card.props.countryCode).toEqual('kr');
        });

        test('should return false for enableStoreDetails in case of zero-auto transaction', () => {
            const card = new CardElement({ core: global.core, amount: { value: 0, currency: 'eur' }, enableStoreDetails: true });
            expect(card.props.enableStoreDetails).toEqual(false);
        });
    });

    describe('payButton', () => {
        describe('Zero auth transaction', () => {
            const i18n = new Language('en-US');
            const props = { core: global.core, amount: { value: 0, currency: 'eur' }, enableStoreDetails: true, i18n };
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
            const card = new CardElement({ core: global.core });
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            const card = new CardElement({ core: global.core });
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.data.paymentMethod.card).toBe('123');
        });

        test('should return storePaymentMethod if enableStoreDetails is enabled', () => {
            const card = new CardElement({ core: global.core, enableStoreDetails: true });
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).toBe(true);
        });

        test('should not return storePaymentMethod if enableStoreDetails is disabled', () => {
            const card = new CardElement({ core: global.core, enableStoreDetails: false });
            card.setState({ storePaymentMethod: true });
            expect(card.data.storePaymentMethod).not.toBeDefined();
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const card = new CardElement({ core: global.core });
            expect(card.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            const card = new CardElement({ core: global.core });
            card.setState({ data: { card: '123' }, isValid: true });
            expect(card.isValid).toBe(true);
        });
    });

    describe('Test setting of configuration prop: koreanAuthenticationRequired', () => {
        test('Returns default value', () => {
            const card = new CardElement({ core: global.core, configuration: {} });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(undefined);
        });

        test('Returns configuration defined value', () => {
            const card = new CardElement({ core: global.core, configuration: { koreanAuthenticationRequired: true } });
            expect(card.props.configuration.koreanAuthenticationRequired).toBe(true);
        });
    });
});
