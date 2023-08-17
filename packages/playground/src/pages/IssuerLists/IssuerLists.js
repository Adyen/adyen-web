import {
    AdyenCheckout,
    Ideal,
    BillDeskOnline,
    BillDeskWallet,
    PayuCashcard,
    PayuNetBanking,
    Dotpay,
    OnlineBankingPL,
    Entercash,
    MolPayEBankingMY,
    PayByBank
} from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

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

    AdyenCheckout.register(
        Ideal,
        BillDeskOnline,
        BillDeskWallet,
        PayuCashcard,
        PayuNetBanking,
        Dotpay,
        OnlineBankingPL,
        Entercash,
        MolPayEBankingMY,
        PayByBank
    );

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
    window.ideal = new Ideal(checkout).mount('.ideal-field');
    return;

    // BillDesk Online
    window.billdesk_online = new BillDeskOnline(checkout).mount('.billdesk_online-field');
    // return;

    //  BillDesk Wallet
    window.billdesk_wallet = checkout.create('billdesk_wallet').mount('.billdesk_wallet-field');

    // PayU CashCard
    window.payu_cashcard = checkout.create('payu_IN_cashcard').mount('.payu_cc-field');

    //  PayU NetBanking
    window.payu_nb = checkout.create('payu_IN_nb').mount('.payu_nb-field');

    // Dotpay
    window.dotpay = checkout.create('dotpay').mount('.dotpay-field');

    // Online banking PL
    window.onlineBanking_PL = new OnlineBankingPL(checkout).mount('.onlinebanking_PL-field');

    // Entercash
    window.entercash = checkout.create('entercash').mount('.entercash-field');

    // Molpay MY
    window.molpay = checkout.create('molpay_ebanking_fpx_MY').mount('.molpay-field');

    // Pay By Bank
    window.paybybank_NL = checkout.create('paybybank').mount('.paybybank_NL-field');
})();
