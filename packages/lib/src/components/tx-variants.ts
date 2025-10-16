export enum TxVariants {
    /** internal */
    address = 'address',
    bankTransfer_IBAN = 'bankTransfer_IBAN',
    bankTransfer_BE = 'bankTransfer_BE',
    bankTransfer_NL = 'bankTransfer_NL',
    bankTransfer_PL = 'bankTransfer_PL',
    bankTransfer_FR = 'bankTransfer_FR',
    bankTransfer_CH = 'bankTransfer_CH',
    bankTransfer_IE = 'bankTransfer_IE',
    bankTransfer_GB = 'bankTransfer_GB',
    bankTransfer_DE = 'bankTransfer_DE',
    bankTransfer_AE = 'bankTransfer_AE',
    bankTransfer_AT = 'bankTransfer_AT',
    bankTransfer_AU = 'bankTransfer_AU',
    bankTransfer_BG = 'bankTransfer_BG',
    bankTransfer_CA = 'bankTransfer_CA',
    bankTransfer_EE = 'bankTransfer_EE',
    bankTransfer_ES = 'bankTransfer_ES',
    bankTransfer_FI = 'bankTransfer_FI',
    bankTransfer_HK = 'bankTransfer_HK',
    bankTransfer_HU = 'bankTransfer_HU',
    bankTransfer_IT = 'bankTransfer_IT',
    bankTransfer_JP = 'bankTransfer_JP',
    bankTransfer_LU = 'bankTransfer_LU',
    bankTransfer_NZ = 'bankTransfer_NZ',
    bankTransfer_PT = 'bankTransfer_PT',
    bankTransfer_SG = 'bankTransfer_SG',
    bankTransfer_SK = 'bankTransfer_SK',
    bankTransfer_US = 'bankTransfer_US',
    donation = 'donation',
    personal_details = 'personal_details',
    dropin = 'dropin',
    /** internal */

    /** Card */
    bcmc = 'bcmc',
    card = 'card',
    scheme = 'scheme',
    storedCard = 'storedCard',
    customCard = 'customcard',
    /** Card */

    /** ThreeDS */
    threeDS2Challenge = 'threeDS2Challenge',
    threeDS2Fingerprint = 'threeDS2Fingerprint',
    threeDS2DeviceFingerprint = 'threeDS2DeviceFingerprint',
    /** ThreeDS */

    /** Direct debit */
    ach = 'ach',
    directdebit_GB = 'directdebit_GB',
    sepadirectdebit = 'sepadirectdebit',
    eft_directdebit_CA = 'eft_directdebit_CA',
    /** Direct debit */

    /** Open Invoice */
    affirm = 'affirm',
    afterpay = 'afterpay',
    afterpay_default = 'afterpay_default',
    afterpay_b2b = 'afterpay_b2b',
    atome = 'atome',
    facilypay_3x = 'facilypay_3x',
    facilypay_4x = 'facilypay_4x',
    facilypay_6x = 'facilypay_6x',
    facilypay_10x = 'facilypay_10x',
    facilypay_12x = 'facilypay_12x',
    ratepay = 'ratepay',
    ratepay_directdebit = 'ratepay_directdebit',
    /** Open Invoice */

    /** Wallets */
    amazonpay = 'amazonpay',
    applepay = 'applepay',
    cashapp = 'cashapp',
    clicktopay = 'clicktopay',
    googlepay = 'googlepay',
    paypal = 'paypal',
    fastlane = 'fastlane',
    paywithgoogle = 'paywithgoogle',
    /** Wallets */

    /** Voucher */
    boletobancario = 'boletobancario',
    boletobancario_itau = 'boletobancario_itau',
    boletobancario_santander = 'boletobancario_santander',
    primeiropay_boleto = 'primeiropay_boleto',
    doku = 'doku',
    doku_alfamart = 'doku_alfamart',
    doku_permata_lite_atm = 'doku_permata_lite_atm',
    doku_indomaret = 'doku_indomaret',
    doku_atm_mandiri_va = 'doku_atm_mandiri_va',
    doku_sinarmas_va = 'doku_sinarmas_va',
    doku_mandiri_va = 'doku_mandiri_va',
    doku_cimb_va = 'doku_cimb_va',
    doku_danamon_va = 'doku_danamon_va',
    doku_bri_va = 'doku_bri_va',
    doku_bni_va = 'doku_bni_va',
    doku_bca_va = 'doku_bca_va',
    doku_wallet = 'doku_wallet',
    oxxo = 'oxxo',
    /** Voucher */

    /** issuerList */
    billdesk_online = 'billdesk_online',
    billdesk_wallet = 'billdesk_wallet',
    dotpay = 'dotpay',
    eps = 'eps',
    molpay_ebanking_fpx_MY = 'molpay_ebanking_fpx_MY',
    molpay_ebanking_TH = 'molpay_ebanking_TH',
    molpay_ebanking_VN = 'molpay_ebanking_VN',
    onlineBanking_CZ = 'onlineBanking_CZ',
    onlinebanking_IN = 'onlinebanking_IN',
    onlineBanking_PL = 'onlineBanking_PL',
    onlineBanking_SK = 'onlineBanking_SK',
    paybybank = 'paybybank',
    payu_IN_cashcard = 'payu_IN_cashcard',
    payu_IN_nb = 'payu_IN_nb',
    wallet_IN = 'wallet_IN',
    /** issuerList */

    /** Dragonpay */
    dragonpay = 'dragonpay',
    dragonpay_ebanking = 'dragonpay_ebanking',
    dragonpay_otc_banking = 'dragonpay_otc_banking',
    dragonpay_otc_non_banking = 'dragonpay_otc_non_banking',
    dragonpay_otc_philippines = 'dragonpay_otc_philippines',
    /** Dragonpay */

    /** Econtext */
    econtext = 'econtext',
    econtext_atm = 'econtext_atm',
    econtext_online = 'econtext_online',
    econtext_seven_eleven = 'econtext_seven_eleven',
    econtext_stores = 'econtext_stores',
    /** Econtext */

    /** Redirect */
    giropay = 'giropay',
    multibanco = 'multibanco',
    redirect = 'redirect',
    twint = 'twint',
    vipps = 'vipps',
    trustly = 'trustly',
    paybybank_AIS_DD = 'paybybank_AIS_DD',
    riverty = 'riverty',
    paybybank_pix = 'paybybank_pix',
    /** Redirect */

    /** Klarna */
    klarna = 'klarna',
    klarna_account = 'klarna_account',
    klarna_paynow = 'klarna_paynow',
    klarna_b2b = 'klarna_b2b',
    /** Klarna */

    /** QRLoader */
    bcmc_mobile = 'bcmc_mobile',
    bcmc_mobile_QR = 'bcmc_mobile_QR',
    pix = 'pix',
    swish = 'swish',
    wechatpay = 'wechatpay',
    wechatpayQR = 'wechatpayQR',
    promptpay = 'promptpay',
    paynow = 'paynow',
    duitnow = 'duitnow',
    /** QRLoader */

    /** Await */
    blik = 'blik',
    mbway = 'mbway',
    ancv = 'ancv',
    payto = 'payto',
    upi = 'upi', // also QR
    upi_qr = 'upi_qr', // also QR
    upi_collect = 'upi_collect', // also QR
    upi_intent = 'upi_intent', // also QR
    /** Await */

    /** Giftcard */
    giftcard = 'giftcard',
    mealVoucher_FR = 'mealVoucher_FR',
    mealVoucher_FR_natixis = 'mealVoucher_FR_natixis',
    mealVoucher_FR_sodexo = 'mealVoucher_FR_sodexo',
    mealVoucher_FR_groupeup = 'mealVoucher_FR_groupeup'
    /** Giftcard */
}
