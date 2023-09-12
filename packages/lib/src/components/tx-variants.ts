export enum TxVariants {
    /** internal */
    address = 'address',
    bankTransfer_IBAN = 'bankTransfer_IBAN',
    donation = 'donation',
    personal_details = 'personal_details',
    /** internal */

    /** Card */
    amex = 'amex',
    bcmc = 'bcmc',
    card = 'card',
    diners = 'diners',
    discover = 'discover',
    jcb = 'jcb',
    kcp = 'kcp',
    maestro = 'maestro',
    mc = 'mc',
    scheme = 'scheme',
    storedCard = 'storedCard',
    securedfields = 'securedfields',
    visa = 'visa',
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
    paywithgoogle = 'paywithgoogle',
    qiwiwallet = 'qiwiwallet',
    /** Wallets */

    /** Voucher */
    boletobancario = 'boletobancario',
    boletobancario_bancodobrasil = 'boletobancario_bancodobrasil',
    boletobancario_bradesco = 'boletobancario_bradesco',
    boletobancario_hsbc = 'boletobancario_hsbc',
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
    entercash = 'entercash',
    eps = 'eps',
    ideal = 'ideal',
    molpay_ebanking_fpx_MY = 'molpay_ebanking_fpx_MY',
    molpay_ebanking_TH = 'molpay_ebanking_TH',
    molpay_ebanking_VN = 'molpay_ebanking_VN',
    onlineBanking = 'onlineBanking',
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
    /** Redirect */

    /** Klarna */
    klarna = 'klarna',
    klarna_account = 'klarna_account',
    klarna_paynow = 'klarna_paynow',
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
    upi = 'upi', // also QR
    upi_qr = 'upi_qr', // also QR
    upi_collect = 'upi_collect', // also QR
    /** Await */

    /** Giftcard */
    giftcard = 'giftcard',
    mealVoucher_FR = 'mealVoucher_FR',
    mealVoucher_FR_natixis = 'mealVoucher_FR_natixis',
    mealVoucher_FR_sodexo = 'mealVoucher_FR_sodexo',
    mealVoucher_FR_groupeup = 'mealVoucher_FR_groupeup'
    /** Giftcard */
}
