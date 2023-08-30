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

    window.core = await AdyenCheckout({
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
    window.ideal = new Ideal({ core: window.core }).mount('.ideal-field');

    // BillDesk Online
    window.billdesk_online = new BillDeskOnline({ core: window.core }).mount('.billdesk_online-field');
    // return;

    //  BillDesk Wallet
    window.billdesk_wallet = new BillDeskWallet({ core: window.core }).mount('.billdesk_wallet-field');

    // PayU CashCard
    window.payu_cashcard = new PayuCashcard({ core: window.core }).mount('.payu_cc-field');

    //  PayU NetBanking
    window.payu_nb = new PayuNetBanking({ core: window.core }).mount('.payu_nb-field');

    // Dotpay
    window.dotpay = new Dotpay({ core: window.core }).mount('.dotpay-field');

    // Online banking PL
    window.onlineBanking_PL = new OnlineBankingPL({ core: window.core }).mount('.onlinebanking_PL-field');

    // Entercash
    window.entercash = new Entercash({ core: window.core }).mount('.entercash-field');

    // Molpay MY
    window.molpay = new MolPayEBankingMY({ core: window.core }).mount('.molpay-field');

    // Pay By Bank
    window.paybybank_NL = new PayByBank({ core: window.core }).mount('.paybybank_NL-field');
})();
