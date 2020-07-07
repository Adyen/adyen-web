import AdyenCheckout from '~';
import { getPaymentMethods, makeDetailsCall } from '../../services';
import { handleResponse, handleSubmit } from '../../handlers';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

window.paymentData = {};

getPaymentMethods().then(paymentMethodsData => {
    window.checkout = new AdyenCheckout({
        locale: shopperLocale,
        paymentMethodsResponse: paymentMethodsData,
        environment: 'test',
        onSubmit: handleSubmit,
        showPayButton: true,
        onAdditionalDetails: (details, component) => {
            component.setStatus('loading');

            makeDetailsCall(details.data).then(response => {
                handleResponse(response, component);
                component.setStatus('ready');
            });
        },
        onError: console.error
    });

    // iDEAL
    window.ideal = checkout.create('ideal').mount('.ideal-field');

    // BillDesk Online
    window.billdesk_online = checkout.create('billdesk_online').mount('.billdesk_online-field');

    //  BillDesk Wallet
    window.billdesk_wallet = checkout.create('billdesk_wallet').mount('.billdesk_wallet-field');

    // PayU CashCard
    window.payu_cashcard = checkout.create('payu_IN_cashcard').mount('.payu_cc-field');

    //  PayU NetBanking
    window.payu_nb = checkout.create('payu_IN_nb').mount('.payu_nb-field');

    // Dotpay
    window.dotpay = checkout.create('dotpay').mount('.dotpay-field');

    // Entercash
    window.entercash = checkout.create('entercash').mount('.entercash-field');

    // Molpay MY
    window.molpay = checkout.create('molpay_ebanking_fpx_MY').mount('.molpay-field');

    // Open Banking OK
    window.openbanking_UK = checkout.create('openbanking_UK').mount('.openbanking_UK-field');
});
