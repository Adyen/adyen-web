import {
    AdyenCheckout,
    BankTransfer,
    MBWay,
    Klarna,
    Ach,
    SepaDirectDebit,
    Vipps,
    Blik,
    Giropay,
    UPI,
    Pix,
    Oxxo,
    Redirect,
    Twint
} from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleChange, handleOnPaymentFailed, handleOnPaymentCompleted } from '../../handlers';
import { amount, shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        ...environmentUrlsOverride,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        // onChange: handleChange,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed,
        onError: (error, component) => {
            console.info(error, component);
        },
        onActionHandled: rtnObj => {
            console.log('onActionHandled', rtnObj);
        }
    });

    // // SEPA Bank Transfer
    // window.bankTransfer = new BankTransfer(checkout, { type: 'bankTransfer_IBAN' }).mount('.bankTransfer-field');// BankTransfer doesn't need constructor
    window.bankTransfer = new BankTransfer(checkout).mount('.bankTransfer-field'); // BankTransfer needs constructor
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
    //
    // MBWay
    window.mbway = new MBWay(checkout).mount('.mbway-field');

    // Klarna Widget
    window.klarnaButton = new Klarna(checkout, { useKlarnaWidget: true }).mount('.klarna-field');

    // ACH
    window.ach = new Ach(checkout, {
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
    }).mount('.ach-field');

    // SEPA Direct Debit
    window.sepa = new SepaDirectDebit(checkout, {
        countryCode: 'NL',
        holderName: true
    }).mount('.sepa-field');

    // // SEPA Direct Debit
    window.vipps = new Vipps(checkout).mount('.vipps-field');
    //
    // // BLIK
    window.blik = new Blik(checkout).mount('.blik-field');
    //
    // // Giropay
    window.giropay = new Giropay(checkout).mount('.giropay-field');
    //
    // // UPI
    window.upi = new UPI(checkout).mount('.upi-field');

    // PIX
    window.pix = new Pix(checkout, { countdownTime: 5 }).mount('.pix-field');

    // Oxxo
    window.oxxo = new Oxxo(checkout).mount('.oxxo-field');

    // Twint
    window.twint = new Twint(checkout).mount('.twint-field');

    // Redirect
    window.alipay = new Redirect(checkout, { type: 'alipay' }).mount('.redirect-field');
});
