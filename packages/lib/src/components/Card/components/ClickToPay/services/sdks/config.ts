const VISA_SDK_TEST = 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';
const VISA_SDK_PROD = 'https://assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';

const MC_SDK_TEST = 'https://sandbox.src.mastercard.com/sdk/srcsdk.mastercard.js';
const MC_SDK_PROD = 'https://src.mastercard.com/sdk/srcsdk.mastercard.js';

const getVisaSetttings = ({ dpaLocale = 'en_US' }) => ({
    dpaTransactionOptions: {
        dpaLocale: dpaLocale,
        payloadTypeIndicator: 'NON_PAYMENT'
    }
});

const getMastercardSettings = ({ dpaLocale = 'en_US' }) => ({
    dpaTransactionOptions: {
        dpaLocale: dpaLocale,
        paymentOptions: {
            dynamicDataType: 'CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM'
        },
        consumerNameRequested: true,
        customInputData: {
            'com.mastercard.dcfExperience': 'PAYMENT_SETTINGS'
        },
        confirmPayment: false
    }
});

export { VISA_SDK_TEST, VISA_SDK_PROD, MC_SDK_TEST, MC_SDK_PROD, getVisaSetttings, getMastercardSettings };
