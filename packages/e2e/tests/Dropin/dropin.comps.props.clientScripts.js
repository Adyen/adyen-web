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

const checkoutConfig = {
    amount: {
        currency: 'USD',
        value: 19000
    },
    shopperLocale: 'en-US',
    clientKey: 'test_F7_FEKJHF',
    environment: 'test',
    paymentMethodsResponse,
    paymentMethodsConfiguration
};

window.dropinConfig = {};

window.mainConfiguration = checkoutConfig;
