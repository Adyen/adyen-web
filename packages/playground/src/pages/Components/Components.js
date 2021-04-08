import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { handleChange, handleSubmit, handleAdditionalDetails } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';

getPaymentMethods({ amount, shopperLocale }).then(paymentMethodsResponse => {
    window.checkout = new AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'test',
        onChange: handleChange,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: console.error,
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

    window.klarnaButton = checkout.create('klarna').mount('.klarna-field');
    window.klarnaWidget = checkout
        .createFromAction({
            type: 'sdk',
            paymentMethodType: 'klarna',
            paymentData: '...',
            sdkData: {
                client_token:
                    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyMzA1ZWJjLWI4MTEtMzYzNy1hYTRjLTY2ZWNhMTg3NGYzZCJ9.eyJzZXNzaW9uX2lkIjoiNmViYTBjZDktMzVkMy0zNzBiLTk5NzUtNzg1MzA0ZGIwNjAzIiwiYmFzZV91cmwiOiJodHRwczovL2pzLnBsYXlncm91bmQua2xhcm5hLmNvbS9ldS9rcCIsImRlc2lnbiI6ImtsYXJuYSIsImxhbmd1YWdlIjoibmwiLCJwdXJjaGFzZV9jb3VudHJ5IjoiTkwiLCJlbnZpcm9ubWVudCI6InBsYXlncm91bmQiLCJtZXJjaGFudF9uYW1lIjoiQWR5ZW4iLCJzZXNzaW9uX3R5cGUiOiJQQVlNRU5UUyIsImNsaWVudF9ldmVudF9iYXNlX3VybCI6Imh0dHBzOi8vZXUucGxheWdyb3VuZC5rbGFybmFldnQuY29tIiwic2NoZW1lIjp0cnVlLCJleHBlcmltZW50cyI6W3sibmFtZSI6ImluLWFwcC1zZGstbmV3LWludGVybmFsLWJyb3dzZXIiLCJ2YXJpYXRlIjoibmV3LWludGVybmFsLWJyb3dzZXItZW5hYmxlIiwicGFyYW1ldGVycyI6eyJ2YXJpYXRlX2lkIjoibmV3LWludGVybmFsLWJyb3dzZXItZW5hYmxlIn19LHsibmFtZSI6ImluLWFwcC1zZGstY2FyZC1zY2FubmluZyIsInZhcmlhdGUiOiJjYXJkLXNjYW5uaW5nLWVuYWJsZSIsInBhcmFtZXRlcnMiOnsidmFyaWF0ZV9pZCI6ImNhcmQtc2Nhbm5pbmctZW5hYmxlIn19XSwicmVnaW9uIjoiZXUifQ.KtcKFP_FGtCEiGrVBm54iz5FpLUDBPHRt8C26PIvo1MjawxquBi7Lm2y_m4wtNTeu229zdKArZ2DFdnzebCDJJ-_PAyoiWv1v85MKrs-R0I1Axz9gmzlEQkjltDTXHFPUj5QNe-2y-l8jBV50xSHXUVPfHI5L9XrjvKuuIcoFla3n1fE6yhBVfiYarty7oca782C5oGNcJcJNRzsPdLD1LzWOQ1HIVVDDeEUsKImPpRbSHM83JrH-uyDbO3rlzEQi8OjeYcvuhGHilsf0RCFjWQYpDMXfu4v4uvcJUofzB7j54sfoq5K9E5dO_sgvENSI7tgw2wBN3uQT5hFD1PeGQ'
            }
        })
        .mount('.klarna-result-field');

    // ACH
    window.ach = checkout
        .create('ach', {
            // holderNameRequired: false,
            // hasHolderName: false,
            onConfigSuccess: obj => {
                console.log('### Components::onConfigSuccess:: obj', obj);
            },
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

    // Redirect
    // window.redirect = checkout.create('paypal').mount('.redirect-field');
});
