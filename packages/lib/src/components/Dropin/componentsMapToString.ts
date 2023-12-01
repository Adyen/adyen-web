import { TxVariants } from '../tx-variants';

/**
 * Maps each component with the string name of its Component element..
 */
export const componentsMapToString = {
    /** internal */
    [TxVariants.address]: 'Address',
    [TxVariants.bankTransfer_IBAN]: 'BankTransfer',
    [TxVariants.donation]: 'Donation',
    [TxVariants.personal_details]: 'PersonalDetails',
    /** internal */

    /** Card */
    [TxVariants.bcmc]: 'Bancontact',
    [TxVariants.card]: 'Card',
    [TxVariants.scheme]: 'Card',
    [TxVariants.storedCard]: 'Card',
    [TxVariants.customCard]: 'CustomCard',
    /** Card */

    /** Direct debit */
    [TxVariants.ach]: 'Ach',
    [TxVariants.directdebit_GB]: 'BacsDD',
    [TxVariants.sepadirectdebit]: 'Sepa',
    /** Direct debit */

    /** Open Invoice */
    [TxVariants.affirm]: 'Affirm',
    [TxVariants.afterpay]: 'AfterPay',
    [TxVariants.afterpay_default]: 'AfterPay',
    [TxVariants.afterpay_b2b]: 'AfterPayB2B',
    [TxVariants.atome]: 'Atome',
    [TxVariants.facilypay_3x]: 'FacilyPay3x',
    [TxVariants.facilypay_4x]: 'FacilyPay4x',
    [TxVariants.facilypay_6x]: 'FacilyPay6x',
    [TxVariants.facilypay_10x]: 'FacilyPay10x',
    [TxVariants.facilypay_12x]: 'FacilyPay12x',
    [TxVariants.ratepay]: 'RatePay',
    [TxVariants.ratepay_directdebit]: 'RatePayDirectDebit',
    /** Open Invoice */

    /** Wallets */
    [TxVariants.amazonpay]: 'AmazonPay',
    [TxVariants.applepay]: 'ApplePay',
    [TxVariants.cashapp]: 'CashAppPay',
    [TxVariants.clicktopay]: 'ClickToPay',
    [TxVariants.googlepay]: 'GooglePay',
    [TxVariants.paypal]: 'PayPal',
    [TxVariants.paywithgoogle]: 'GooglePay',
    /** Wallets */

    /** Voucher */
    [TxVariants.boletobancario]: 'Boleto',
    [TxVariants.boletobancario_itau]: 'Boleto',
    [TxVariants.boletobancario_santander]: 'Boleto',
    [TxVariants.doku]: 'Doku',
    [TxVariants.doku_alfamart]: 'Doku',
    [TxVariants.doku_permata_lite_atm]: 'Doku',
    [TxVariants.doku_indomaret]: 'Doku',
    [TxVariants.doku_atm_mandiri_va]: 'Doku',
    [TxVariants.doku_sinarmas_va]: 'Doku',
    [TxVariants.doku_mandiri_va]: 'Doku',
    [TxVariants.doku_cimb_va]: 'Doku',
    [TxVariants.doku_danamon_va]: 'Doku',
    [TxVariants.doku_bri_va]: 'Doku',
    [TxVariants.doku_bni_va]: 'Doku',
    [TxVariants.doku_bca_va]: 'Doku',
    [TxVariants.doku_wallet]: 'Doku',
    [TxVariants.oxxo]: 'Oxxo',
    [TxVariants.primeiropay_boleto]: 'Boleto',
    /** Voucher */

    /** issuerList */
    [TxVariants.billdesk_online]: 'BillDeskOnline',
    [TxVariants.billdesk_wallet]: 'BillDeskWallet',
    [TxVariants.dotpay]: 'Dotpay',
    [TxVariants.eps]: 'Eps',
    [TxVariants.ideal]: 'Ideal',
    [TxVariants.molpay_ebanking_fpx_MY]: 'MolPayEBankingMY',
    [TxVariants.molpay_ebanking_TH]: 'MolPayEBankingTH',
    [TxVariants.molpay_ebanking_VN]: 'MolPayEBankingVN',
    [TxVariants.onlineBanking_CZ]: 'OnlineBankingCZElement',
    [TxVariants.onlinebanking_IN]: 'OnlineBankingINElement', // NOTE ]: the txVariant does have a lowercase "b"
    [TxVariants.onlineBanking_PL]: 'OnlinebankingPL',
    [TxVariants.onlineBanking_SK]: 'OnlineBankingSKElement',
    [TxVariants.paybybank]: 'PayByBank',
    [TxVariants.payu_IN_cashcard]: 'PayuCashcard',
    [TxVariants.payu_IN_nb]: 'PayuNetBanking',
    [TxVariants.wallet_IN]: 'WalletINElement',
    /** issuerList */

    /** Dragonpay */
    [TxVariants.dragonpay_ebanking]: 'Dragonpay',
    [TxVariants.dragonpay_otc_banking]: 'Dragonpay',
    [TxVariants.dragonpay_otc_non_banking]: 'Dragonpay',
    [TxVariants.dragonpay_otc_philippines]: 'Dragonpay',
    /** Dragonpay */

    /** Econtext */
    [TxVariants.econtext_atm]: 'Econtext',
    [TxVariants.econtext_online]: 'Econtext',
    [TxVariants.econtext_seven_eleven]: 'Econtext',
    [TxVariants.econtext_stores]: 'Econtext',
    /** Econtext */

    /** Redirect */
    [TxVariants.giropay]: 'Giropay',
    [TxVariants.multibanco]: 'Multibanco',
    [TxVariants.redirect]: 'Redirect',
    [TxVariants.twint]: 'Twint',
    [TxVariants.vipps]: 'Vipps',
    [TxVariants.trustly]: 'Trustly',
    /** Redirect */

    /** Klarna */
    [TxVariants.klarna]: 'Klarna',
    [TxVariants.klarna_account]: 'Klarna',
    [TxVariants.klarna_paynow]: 'Klarna',
    /** Klarna */

    /** QRLoader */
    [TxVariants.bcmc_mobile]: 'BcmcMobile',
    [TxVariants.bcmc_mobile_QR]: 'BcmcMobile',
    [TxVariants.pix]: 'Pix',
    [TxVariants.swish]: 'Swish',
    [TxVariants.wechatpay]: 'WeChat',
    [TxVariants.wechatpayQR]: 'WeChat',
    [TxVariants.promptpay]: 'PromptPay',
    [TxVariants.paynow]: 'PayNow',
    [TxVariants.duitnow]: 'Duitnow',
    /** QRLoader */

    /** Await */
    [TxVariants.blik]: 'Blik',
    [TxVariants.mbway]: 'MBWay',
    [TxVariants.upi]: 'UPI', // also QR
    [TxVariants.upi_qr]: 'UPI', // also QR
    [TxVariants.upi_collect]: 'UPI', // also QR
    /** Await */

    /** Giftcard */
    [TxVariants.giftcard]: 'Giftcard',
    [TxVariants.mealVoucher_FR_natixis]: 'MealVoucherFR',
    [TxVariants.mealVoucher_FR_sodexo]: 'MealVoucherFR',
    [TxVariants.mealVoucher_FR_groupeup]: 'MealVoucherFR'
    /** Giftcard */
};
