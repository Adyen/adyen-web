import { mount } from 'enzyme';
import AdyenCheckout from './core';
import { PaymentMethodsResponse } from '../types';
import { PayPal, Card, Dropin, Redirect } from '../components';
import { CoreConfiguration } from './types';

const paymentMethodsResponse: PaymentMethodsResponse = {
    paymentMethods: [
        {
            brands: ['visa', 'mc', 'amex', 'maestro', 'bcmc', 'cartebancaire'],
            name: 'Credit Card',
            type: 'scheme'
        },
        {
            name: 'PayPal',
            type: 'paypal',
            configuration: {
                merchantId: '1000',
                intent: 'authorize'
            }
        },
        { name: 'UnionPay', type: 'unionpay' }
    ],
    storedPaymentMethods: [
        {
            brand: 'visa',
            expiryMonth: '03',
            expiryYear: '2030',
            holderName: 'Checkout Shopper PlaceHolder',
            id: '8415',
            lastFour: '1111',
            name: 'VISA',
            networkTxReference: '0591',
            supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
            type: 'scheme',
            storedPaymentMethodId: '8415'
        }
    ]
};

const coreOptions: CoreConfiguration = {
    amount: {
        currency: 'USD',
        value: 19000
    },
    locale: 'en-US',
    environment: 'test',
    clientKey: 'test_F7_FEKJHF',
    paymentMethodsResponse,
    analytics: {
        enabled: false
    }
};

const brandsArray = paymentMethodsResponse.paymentMethods[0].brands;

describe('Core - tests ensuring props reach components', () => {
    describe('Standalone components', () => {
        test('Test that expected props are propagated to a standalone storedCard ', async () => {
            const checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();

            const component = new Card(checkout, {
                ...paymentMethodsResponse.storedPaymentMethods[0],
                hideCVC: true
            });

            // @ts-ignore Testing that property is available on component
            expect(component.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(component.props.loadingContext).toEqual('https://checkoutshopper-test.adyen.com/checkoutshopper/');
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // Props passed to Component
            expect(component.props.expiryMonth).toEqual('03');
            expect(component.props.lastFour).toEqual('1111');
            expect(component.props.hideCVC).toEqual(true);
        });

        test('Test that expected props are propagated to a standalone Card ', async () => {
            const checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();
            const component = new Card(checkout, { showInstallmentAmounts: true });

            // @ts-ignore Testing that property is available on component
            expect(component.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(component.props.loadingContext).toEqual('https://checkoutshopper-test.adyen.com/checkoutshopper/');
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // Props from relevant pmResponse paymentMethod
            expect(component.props.brands).toEqual(brandsArray);

            // Props from config object passed when card is created
            expect(component.props.showInstallmentAmounts).toEqual(true);
        });

        test('Test that expected props are propagated to a standalone redirect comp created as "redirect" ', async () => {
            const pmObj = paymentMethodsResponse.paymentMethods.find(el => el.type === 'unionpay');

            const checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();
            const component = new Redirect(checkout, { type: 'unionpay', ...pmObj });

            // @ts-ignore Testing that property is available on component
            expect(component.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // Props from relevant pmResponse paymentMethod
            expect(component.props.name).toEqual('UnionPay');
        });

        test('Test that expected props are propagated to a standalone PayPal', async () => {
            const checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();
            const component = new PayPal(checkout, { enableMessages: true });

            // @ts-ignore Testing that property is available on component
            expect(component.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // Props from relevant pmResponse paymentMethod
            expect(component.props.configuration.merchantId).toEqual('1000');
            expect(component.props.configuration.intent).toEqual('authorize');

            // Props from config passed when creating it
            expect(component.props.enableMessages).toEqual(true);
        });
    });

    describe('Dropin', () => {
        test('Dropin component receives correct props ', async () => {
            const checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();
            const dropin = new Dropin(checkout, {
                showStoredPaymentMethods: false,
                openFirstPaymentMethod: false
            });

            // Props from core.getCorePropsForComponent()
            // @ts-ignore Testing that property is available on component
            expect(dropin.core).toEqual(checkout);
            expect(dropin.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(dropin.props.amount.value).toEqual(19000);

            // Props from config object passed when dropin is created
            expect(dropin.props.showStoredPaymentMethods).toEqual(false);
            expect(dropin.props.openFirstPaymentMethod).toEqual(false);
        });
    });

    /**
     * DROPIN *created* components ie. items in the PM list
     */
    describe('Tests for dropin created components', () => {
        let dropin;
        let checkout;

        beforeEach(async () => {
            checkout = new AdyenCheckout(coreOptions);
            await checkout.initialize();
            dropin = new Dropin(checkout, {
                paymentMethodsConfiguration: {
                    card: {
                        hasHolderName: true,
                        holderNameRequired: true,
                        positionHolderNameOnTop: true
                    },
                    storedCard: {
                        hideCVC: true
                    },
                    unionpay: {
                        foo: 'bar'
                    },
                    paypal: {
                        enableMessages: true
                    }
                }
            });
        });

        test('StoredCard in Dropin receives correct props ', async () => {
            mount(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const storedCard = dropin.dropinRef.state.storedPaymentElements[0];

            expect(storedCard.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(storedCard.props.i18n).not.toEqual(null);
            expect(storedCard.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(storedCard.props.amount.value).toEqual(19000);

            // Props from Dropin commonProps()
            expect(storedCard.props.showPayButton).toEqual(true);
            expect(storedCard.props.isDropin).toEqual(true);
            expect(storedCard.props.oneClick).toEqual(true);
            expect(storedCard.props.elementRef).not.toEqual(null);

            // Props from storedCard object in paymentMethodsResponse.storedPaymentMethods
            expect(storedCard.props.brand).toEqual('visa');
            expect(storedCard.props.storedPaymentMethodId).toEqual('8415');
            expect(storedCard.props.expiryYear).toEqual('2030');

            // Props from relevant paymentMethodsConfiguration object
            expect(storedCard.props.hideCVC).toEqual(true);
        });

        test('Card in Dropin receives correct props ', async () => {
            mount(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const card = dropin.dropinRef.state.elements[0];

            expect(card.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(card.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(card.props.amount.value).toEqual(19000);

            // Props from Dropin commonProps()
            expect(card.props.showPayButton).toEqual(true);
            expect(card.props.isDropin).toEqual(true);
            expect(card.props.oneClick).not.toBeDefined();
            expect(card.props.elementRef).not.toEqual(null);

            // Props from card object in paymentMethodsResponse.paymentMethods
            expect(card.props.brands).toEqual(brandsArray);
            expect(card.props.name).toEqual('Credit Card');

            // Props from relevant paymentMethodsConfiguration object
            expect(card.props.hasHolderName).toEqual(true);
            expect(card.props.holderNameRequired).toEqual(true);
            expect(card.props.positionHolderNameOnTop).toEqual(true);
        });

        test('PayPal in Dropin receives correct props ', async () => {
            mount(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const paypal = dropin.dropinRef.state.elements[1];

            expect(paypal.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(paypal.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(paypal.props.amount.value).toEqual(19000);

            // Props from Dropin commonProps()
            expect(paypal.props.showPayButton).toEqual(true);
            expect(paypal.props.isDropin).toEqual(true);
            expect(paypal.props.elementRef).not.toEqual(null);

            // Props from paypal object in paymentMethodsResponse.paymentMethods
            expect(paypal.props.configuration.merchantId).toEqual('1000');
            expect(paypal.props.configuration.intent).toEqual('authorize');

            // Props from relevant paymentMethodsConfiguration object
            expect(paypal.props.enableMessages).toEqual(true);
        });

        test('Redirect PM in Dropin receives correct props ', async () => {
            mount(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const redirect = dropin.dropinRef.state.elements[2];

            expect(redirect.core).toEqual(checkout);

            // Props from core.getCorePropsForComponent()
            expect(redirect.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(redirect.props.amount.value).toEqual(19000);

            // Props from Dropin commonProps()
            expect(redirect.props.showPayButton).toEqual(true);
            expect(redirect.props.isDropin).toEqual(true);
            expect(redirect.props.elementRef).not.toEqual(null);

            // Props from object in paymentMethodsResponse.paymentMethods
            expect(redirect.props.name).toEqual('UnionPay');

            // Props from relevant paymentMethodsConfiguration object
            expect(redirect.props.foo).toEqual('bar');

            // Props from Redirect.formatProps()
            expect(redirect.props.type).toEqual('unionpay');
        });
    });
});
