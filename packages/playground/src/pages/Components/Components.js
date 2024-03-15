import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleChange } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        onChange: handleChange,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: (error, component) => {
            console.info(error, component);
        },
        onActionHandled: rtnObj => {
            console.log('onActionHandled', rtnObj);
        },
        showPayButton: true
    });

    // SEPA Bank Transfer
    window.bankTransfer = checkout.create('bankTransfer_IBAN').mount('.bankTransfer-field');
    window.bankTransferResult = checkout
        .createFromAction({
            paymentMethodType: 'bankTransfer_IBAN',
            totalAmount: {
                currency: 'EUR',
                value: 1000
            },
            beneficiary: 'Adyen',
            iban: 'NL13TEST0123456789',
            bic: 'TESTNL02',
            reference: '991-6068-3254-7284F',
            type: 'bankTransfer',
            shopperEmail: 'shopper@email.com'
        })
        .mount('.bankTransfer-result-field');

    // MBWay
    window.mbway = checkout.create('mbway').mount('.mbway-field');

    // Klarna Widget
    window.klarnaButton = checkout.create('klarna').mount('.klarna-field');

    // ACH
    window.ach = checkout
        .create('ach', {
            // holderNameRequired: false,
            // hasHolderName: false,
            //            onConfigSuccess: obj => {
            //                console.log('### Components::onConfigSuccess:: obj', obj);
            //            },
            // billingAddressRequired: false,
            // billingAddressAllowedCountries: ['US', 'PR'],
            data: {
                // holderName: 'B. Fish',
                billingAddress: {
                    street: 'Infinite Loop',
                    postalCode: '95014',
                    city: 'Cupertino',
                    houseNumberOrName: '1',
                    country: 'US',
                    stateOrProvince: 'CA'
                }
            }
        })
        .mount('.ach-field');

    // SEPA Direct Debit
    window.sepa = checkout
        .create('sepadirectdebit', {
            countryCode: 'NL',
            holderName: true
        })
        .mount('.sepa-field');

    // Qiwi
    window.qiwi = checkout.create('qiwiwallet', {}).mount('.qiwi-field');

    // SEPA Direct Debit
    window.vipps = checkout.create('vipps').mount('.vipps-field');

    // BLIK
    window.blik = checkout.create('blik', {}).mount('.blik-field');

    // Giropay
    window.giropay = checkout.create('giropay').mount('.giropay-field');

    // UPI
    window.upi = checkout.create('upi').mount('.upi-field', {
        appIds: [
            {
                id: 'bhim',
                name: 'BHIM'
            },
            {
                id: 'gpay',
                name: 'Google Pay'
            },
            {
                id: 'PhonePe',
                name: 'Phone Pe'
            }
        ]
    });

    // PIX
    window.pix = checkout.create('pix', { countdownTime: 5 }).mount('.pix-field');

    // Oxxo
    window.oxxo = checkout.create('oxxo').mount('.oxxo-field');

    // Redirect
    // window.redirect = checkout.create('paypal').mount('.redirect-field');
});
