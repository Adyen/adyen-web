import AdyenCheckout from './core';
import { PaymentMethodsConfiguration } from './types';
// import { InstantPaymentTypes } from '../components/Dropin/types';

const paymentMethodsResponse = {
    paymentMethods: [
        {
            brands: ['visa', 'mc', 'amex', 'maestro', 'bcmc', 'cartebancaire'],
            name: 'Credit Card',
            type: 'scheme'
        },
        {
            name: 'Google Pay',
            type: 'paywithgoogle',
            configuration: {
                merchantId: '1000',
                gatewayMerchantId: 'TestMerchantCheckout'
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

const paymentMethodsConfiguration = {
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
    paywithgoogle: {
        foo: 'bar'
    }
};

// const coreGetPropsForCompsObj = {
//     paymentMethods:  array of stored paymentMethods,
//     storedPaymentMethods: array of paymentMethods,
//     i18n: Language,
//     modules:{analytics, i18n, risk},// refs to internal modules
//     session: undefined,
//     createFromAction: function,
//     _parentInstance: Core
// }

// const dropinGetCommonProps = {
//     beforeSubmit: undefined,
//     onSubmit: function ref,
//     elementRef: ref to DropinElement,
//     showPayButton: true,
//     isDropin: true,
// }

const checkoutConfig = {
    amount: {
        currency: 'USD',
        value: 19000
    },
    shopperLocale: 'en-US',
    clientKey: 'test_F7_FEKJHF',
    environment: 'test',
    paymentMethodsResponse,
    paymentMethodsConfiguration: paymentMethodsConfiguration as PaymentMethodsConfiguration
};

const brandsArray = paymentMethodsResponse.paymentMethods[0].brands;

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
    console.warn = jest.fn(() => {});
});

describe('Core - tests ensuring props reach components', () => {
    /**
     * COMPONENTS
     */
    describe('Tests for standalone components', () => {
        test('Test that expected props are propagated to a standalone storedCard ', () => {
            const checkout = new AdyenCheckout(checkoutConfig);
            const component = checkout.create('card', paymentMethodsResponse.storedPaymentMethods[0]);

            // expect props from core.getPropsForComps()
            expect(component.props._parentInstance).not.toEqual(null);
            expect(component.props.storedPaymentMethods).toEqual(paymentMethodsResponse.storedPaymentMethods);

            // expect props from core.processGlobalOptions
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // expect props from relevant pmResponse paymentMethod
            expect(component.props.expiryMonth).toEqual('03');
            expect(component.props.lastFour).toEqual('1111');

            // expect props from relevant paymentMethodsConfiguration object
            expect(component.props.hideCVC).toEqual(true);

            // expect mapped prop from Card.formatProps() ('scheme' -> 'card')
            expect(component.props.type).toEqual('card');
        });

        test('Test that expected props are propagated to a standalone Card ', () => {
            const checkout = new AdyenCheckout(checkoutConfig);
            const component = checkout.create('card', { legacyInputMode: true });

            // expect props from core.getPropsForComps()
            expect(component.props._parentInstance).not.toEqual(null);
            expect(component.props.storedPaymentMethods).toEqual(paymentMethodsResponse.storedPaymentMethods); // will still have refs from full pmResponse object
            expect(component.props.paymentMethods).toEqual(paymentMethodsResponse.paymentMethods);

            // expect props from core.processGlobalOptions
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // expect props from relevant pmResponse paymentMethod
            expect(component.props.brands).toEqual(brandsArray);

            // expect props from relevant paymentMethodsConfiguration object
            expect(component.props.hasHolderName).toEqual(true);
            expect(component.props.positionHolderNameOnTop).toEqual(true);

            // expect props from config object passed when card is created
            expect(component.props.legacyInputMode).toEqual(true);

            // expect prop from Card.formatProps()
            expect(component.props.type).toEqual('card');
        });

        test('Test that expected props are propagated to a standalone redirect comp created as "redirect" ', () => {
            const pmObj = paymentMethodsResponse.paymentMethods.find(el => el.type === 'unionpay');

            const checkout = new AdyenCheckout(checkoutConfig);
            const component = checkout.create('redirect', pmObj);

            // expect props from core.getPropsForComps()
            expect(component.props._parentInstance).not.toEqual(null);
            expect(component.props.paymentMethods).toEqual(paymentMethodsResponse.paymentMethods);

            // expect props from core.processGlobalOptions
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // expect props from relevant pmResponse paymentMethod
            expect(component.props.name).toEqual('UnionPay');

            // expect props from relevant paymentMethodsConfiguration object
            expect(component.props.foo).toEqual('bar');

            // expect prop from Card.formatProps()
            expect(component.props.type).toEqual('unionpay');
        });

        test('Test that expected props are propagated to a standalone redirect comp created as "unionpay" ', () => {
            const checkout = new AdyenCheckout(checkoutConfig);
            const component = checkout.create('unionpay');

            // expect props from core.getPropsForComps()
            expect(component.props._parentInstance).not.toEqual(null);
            expect(component.props.paymentMethods).toEqual(paymentMethodsResponse.paymentMethods);

            // expect props from core.processGlobalOptions
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // expect props from relevant pmResponse paymentMethod
            expect(component.props.name).toEqual('UnionPay');

            // expect props from relevant paymentMethodsConfiguration object
            expect(component.props.foo).toEqual('bar');

            // expect prop from Card.formatProps()
            expect(component.props.type).toEqual('unionpay');
        });

        test('Test that expected props are propagated to a standalone google pay com', () => {
            const checkout = new AdyenCheckout(checkoutConfig);
            const component = checkout.create('paywithgoogle');

            // expect props from core.getPropsForComps()
            expect(component.props._parentInstance).not.toEqual(null);
            expect(component.props['paymentMethods']).toEqual(paymentMethodsResponse.paymentMethods);

            // expect props from core.processGlobalOptions
            expect(component.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(component.props.amount.value).toEqual(19000);

            // expect props from relevant pmResponse paymentMethod
            expect(component.props.configuration.gatewayMerchantId).toEqual('TestMerchantCheckout');

            // expect props from relevant paymentMethodsConfiguration object
            expect(component.props['foo']).toEqual('bar');

            // expect props from GooglePay.formatProps()
            expect(component.props.type).toEqual('paywithgoogle');
            expect(component.props.buttonSizeMode).toEqual('static');
        });
    });

    /**
     * DROPIN
     */
    describe.only('Tests for dropin & dropin created components', () => {
        // const instPMTypesArr: InstantPaymentTypes[] = ['paywithgoogle'];

        test('Dropin component receives correct props ', () => {
            const checkout = new AdyenCheckout(checkoutConfig);
            const dropin = checkout.create('dropin', {
                showStoredPaymentMethods: false,
                openFirstPaymentMethod: false
            });

            // expect props from core.getPropsForComps()
            expect(dropin.props._parentInstance).not.toEqual(null);
            expect(dropin.props.paymentMethods).toEqual(paymentMethodsResponse.paymentMethods);

            // expect props from core.processGlobalOptions
            expect(dropin.props.clientKey).toEqual('test_F7_FEKJHF');
            expect(dropin.props.amount.value).toEqual(19000);

            // expect props from config object passed when dropin is created
            expect(dropin.props.showStoredPaymentMethods).toEqual(false);
            expect(dropin.props.openFirstPaymentMethod).toEqual(false);

            //
            expect(dropin.props.type).toEqual('dropin');
        });
    });
});

describe('Props reach standalone card component regardless of how the component is created', () => {
    test('Card component created as "scheme" receives correct props ', () => {
        const checkout = new AdyenCheckout(checkoutConfig);
        const component = checkout.create('scheme', { legacyInputMode: true });

        expect(component.props._parentInstance).not.toEqual(null); // core.getPropsForComps
        expect(component.props.amount.value).toEqual(19000); // core.processGlobalOptions
        expect(component.props.brands).toEqual(brandsArray); // pmResp
        expect(component.props.hasHolderName).toEqual(true); // pmConfig
        expect(component.props.legacyInputMode).toEqual(true); // card.config

        // expect prop from Card.formatProps()
        expect(component.props.type).toEqual('card');
    });
});

describe('Trying to add a "scheme" property to the paymentMethodsConfiguration throws an error', () => {
    const paymentMethodsConfiguration = {
        scheme: {
            hasHolderName: true
        }
    };

    test('Trying to create a card component with a paymentMethodsConfiguration with a "scheme" property shows a warning in the console ', () => {
        new AdyenCheckout({ paymentMethodsConfiguration });
        // expect warning in console
        expect(console.warn).toHaveBeenCalled();
    });
});
