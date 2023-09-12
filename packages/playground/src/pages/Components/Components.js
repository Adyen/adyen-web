import {
    AdyenCheckout,
    BankTransfer,
    MBWay,
    Klarna,
    Ach,
    SepaDirectDebit,
    QiwiWallet,
    Vipps,
    Blik,
    Giropay,
    UPI,
    Pix,
    Oxxo,
    Redirect,
    Twint,
    en_US
} from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

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
        locale: en_US,
        environment: process.env.__CLIENT_ENV__,
        onChange: handleChange,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: (error, component) => {
            console.info(error, component);
        },
        onActionHandled: rtnObj => {
            console.log('onActionHandled', rtnObj);
        }
    });

    // // SEPA Bank Transfer
    // window.bankTransfer = new BankTransfer(checkout, { type: 'bankTransfer_IBAN' }).mount('.bankTransfer-field');// BankTransfer doesn't need constructor
    window.bankTransfer = new BankTransfer({ core: checkout }).mount('.bankTransfer-field'); // BankTransfer needs constructor
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
    window.mbway = new MBWay({ core: checkout }).mount('.mbway-field');

    // Klarna Widget
    window.klarnaButton = new Klarna({ core: checkout, useKlarnaWidget: true }).mount('.klarna-field');

    // ACH
    window.ach = new Ach({
        core: checkout,
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
    window.sepa = new SepaDirectDebit({
        core: checkout,
        countryCode: 'NL',
        holderName: true
    }).mount('.sepa-field');
    //
    // // Qiwi
    window.qiwi = new QiwiWallet({ core: checkout }).mount('.qiwi-field');
    //
    // // SEPA Direct Debit
    window.vipps = new Vipps({ core: checkout }).mount('.vipps-field');
    //
    // // BLIK
    window.blik = new Blik({ core: checkout }).mount('.blik-field');
    //
    // // Giropay
    window.giropay = new Giropay({ core: checkout }).mount('.giropay-field');
    //
    // // UPI
    window.upi = new UPI({ core: checkout }).mount('.upi-field');

    // PIX
    window.pix = new Pix({ core: checkout, countdownTime: 5 }).mount('.pix-field');

    // Oxxo
    window.oxxo = new Oxxo({ core: checkout }).mount('.oxxo-field');

    // Twint
    window.twint = new Twint({ core: checkout }).mount('.twint-field');

    // Redirect
    window.alipay = new Redirect({ core: checkout, type: 'alipay' }).mount('.redirect-field');
});
