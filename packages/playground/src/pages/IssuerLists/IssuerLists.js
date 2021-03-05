import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { getPaymentMethods, makeDetailsCall, createSession } from '../../services';
import { handleResponse, handleSubmit } from '../../handlers';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

window.paymentData = {};

(async () => {
    const session = await createSession({
        amount: {
            value: 123,
            currency: 'EUR'
        },
        reference: 'ABC123',
        returnUrl: 'http://localhost:3020/'
    });

    window.checkout = await AdyenCheckout({
        clientKey: 'devl_F73CCZ4Y7NHFRLC3OMVZHDIVQY47VWFL', //process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: 'http://localhost:8080/checkoutshopper/',
        showPayButton: true,
        onAdditionalDetails: (details, component) => {
            component.setStatus('loading');

            makeDetailsCall(details.data).then(response => {
                handleResponse(response, component);
                component.setStatus('ready');
            });
        },
        onError: console.error,
        session
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
})();
