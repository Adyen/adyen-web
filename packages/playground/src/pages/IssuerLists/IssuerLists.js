import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { createSession } from '../../services';
import { shopperLocale, countryCode, returnUrl } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

(async () => {
    const session = await createSession({
        amount: {
            value: 123,
            currency: 'EUR'
        },
        reference: 'ABC123',
        returnUrl,
        countryCode
    });

    window.checkout = await AdyenCheckout({
        session,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        showPayButton: true,
        onError: console.error,
        paymentMethodsConfiguration: {
            ideal: {
                highlightedIssuers: ['1121', '1154', '1152']
            }
        }
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

    // Online banking PL
    window.onlineBanking_PL = checkout.create('onlineBanking_PL').mount('.onlinebanking_PL-field');

    // Entercash
    window.entercash = checkout.create('entercash').mount('.entercash-field');

    // Molpay MY
    window.molpay = checkout.create('molpay_ebanking_fpx_MY').mount('.molpay-field');
})();
