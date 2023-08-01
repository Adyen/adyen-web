import { AfterPay, AfterPayB2B } from './AfterPay';
import AmazonPay from './AmazonPay';
import ApplePay from './ApplePay';
import Atome from './Atome';
import { BillDeskOnline, BillDeskWallet } from './BillDesk';
import Card from './Card';
import CashAppPay from './CashAppPay';
import ClickToPay from './ClickToPay';
import Bancontact from './Card/Bancontact';
import Donation from './Donation';
import Giropay from './Giropay';
import GooglePay from './GooglePay';
import Entercash from './Entercash';
import Econtext from './Econtext';
import { FacilyPay3x, FacilyPay4x, FacilyPay6x, FacilyPay10x, FacilyPay12x } from './FacilyPay';
import Ideal from './Ideal';
import PayPal from './PayPal';
import QiwiWallet from './QiwiWallet';
import Redirect from './Redirect';
import SecuredFields from './SecuredFields';
import Sepa from './Sepa';
import { ThreeDS2DeviceFingerprint, ThreeDS2Challenge } from './ThreeDS2';
import WeChat from './WeChat';
import PayNow from './PayNow';
import BcmcMobile from './BcmcMobile';
import { MolPayEBankingMY, MolPayEBankingTH, MolPayEBankingVN } from './MolPayEBanking';
import Dragonpay from './Dragonpay';
import Doku from './Doku';
import Boleto from './Boleto';
import Oxxo from './Oxxo';
import Multibanco from './Multibanco';
import Dotpay from './Dotpay';
import Eps from './EPS';
import Giftcard from './Giftcard';
import Vipps from './Vipps';
import { PayuCashcard, PayuNetBanking } from './PayU';
import RatePay from './RatePay';
import Swish from './Swish';
import Dropin from './Dropin';
import Ach from './Ach';
import MBWay from './MBWay';
import Blik from './Blik';
import BankTransfer from './BankTransfer';
import Affirm from './Affirm';
import Pix from './Pix';
import uuid from '../utils/uuid';
import BacsDD from './BacsDD';
import Address from './Address';
import PersonalDetails from './PersonalDetails';
import Klarna from './Klarna';
import Twint from './Twint';
import MealVoucherFR from './MealVoucherFR';
import OnlineBankingINElement from './OnlineBankingIN';
import OnlinebankingPL from './OnlinebankingPL';
import RatePayDirectDebit from './RatePay/RatePayDirectDebit';
import UPI from './UPI';
import WalletINElement from './WalletIN';
import OnlineBankingCZElement from './OnlineBankingCZ';
import OnlineBankingSKElement from './OnlineBankingSK';
import PayByBank from './PayByBank';
import PromptPay from './PromptPay';
import Duitnow from './DuitNow';
import ANCV from './ANCV';

/**
 * Maps each component with a Component element.
 */
const componentsMap = {
    /** internal */
    address: Address,
    bankTransfer_IBAN: BankTransfer,
    donation: Donation,
    dropin: Dropin,
    personal_details: PersonalDetails,
    /** internal */

    /** Card */
    amex: Card,
    bcmc: Bancontact,
    card: Card,
    diners: Card,
    discover: Card,
    jcb: Card,
    kcp: Card,
    maestro: Card,
    mc: Card,
    scheme: Card,
    storedCard: Card,
    securedfields: SecuredFields,
    threeDS2Challenge: ThreeDS2Challenge,
    threeDS2DeviceFingerprint: ThreeDS2DeviceFingerprint,
    visa: Card,
    /** Card */

    /** Direct debit */
    ach: Ach,
    directdebit_GB: BacsDD,
    sepadirectdebit: Sepa,
    /** Direct debit */

    /** Open Invoice */
    affirm: Affirm,
    afterpay: AfterPay,
    afterpay_default: AfterPay,
    afterpay_b2b: AfterPayB2B,
    atome: Atome,
    facilypay_3x: FacilyPay3x,
    facilypay_4x: FacilyPay4x,
    facilypay_6x: FacilyPay6x,
    facilypay_10x: FacilyPay10x,
    facilypay_12x: FacilyPay12x,
    ratepay: RatePay,
    ratepay_directdebit: RatePayDirectDebit,
    /** Open Invoice */

    /** Wallets */
    amazonpay: AmazonPay,
    applepay: ApplePay,
    cashapp: CashAppPay,
    clicktopay: ClickToPay,
    googlepay: GooglePay,
    paypal: PayPal,
    paywithgoogle: GooglePay,
    qiwiwallet: QiwiWallet,
    /** Wallets */

    /** Voucher */
    boletobancario: Boleto,
    boletobancario_bancodobrasil: Boleto,
    boletobancario_bradesco: Boleto,
    boletobancario_hsbc: Boleto,
    boletobancario_itau: Boleto,
    boletobancario_santander: Boleto,
    doku: Doku,
    doku_alfamart: Doku,
    doku_permata_lite_atm: Doku,
    doku_indomaret: Doku,
    doku_atm_mandiri_va: Doku,
    doku_sinarmas_va: Doku,
    doku_mandiri_va: Doku,
    doku_cimb_va: Doku,
    doku_danamon_va: Doku,
    doku_bri_va: Doku,
    doku_bni_va: Doku,
    doku_bca_va: Doku,
    doku_wallet: Doku,
    oxxo: Oxxo,
    primeiropay_boleto: Boleto,
    /** Voucher */

    /** issuerList */
    billdesk_online: BillDeskOnline,
    billdesk_wallet: BillDeskWallet,
    dotpay: Dotpay,
    entercash: Entercash,
    eps: Eps,
    ideal: Ideal,
    molpay_ebanking_fpx_MY: MolPayEBankingMY,
    molpay_ebanking_TH: MolPayEBankingTH,
    molpay_ebanking_VN: MolPayEBankingVN,
    onlineBanking: Dotpay,
    onlineBanking_CZ: OnlineBankingCZElement,
    onlinebanking_IN: OnlineBankingINElement, // NOTE : the txVariant does have a lowercase "b"
    onlineBanking_PL: OnlinebankingPL,
    onlineBanking_SK: OnlineBankingSKElement,
    paybybank: PayByBank,
    payu_IN_cashcard: PayuCashcard,
    payu_IN_nb: PayuNetBanking,
    wallet_IN: WalletINElement,
    /** issuerList */

    /** Dragonpay */
    dragonpay_ebanking: Dragonpay,
    dragonpay_otc_banking: Dragonpay,
    dragonpay_otc_non_banking: Dragonpay,
    dragonpay_otc_philippines: Dragonpay,
    /** Dragonpay */

    /** Econtext */
    econtext_atm: Econtext,
    econtext_online: Econtext,
    econtext_seven_eleven: Econtext,
    econtext_stores: Econtext,
    /** Econtext */

    /** Redirect */
    giropay: Giropay,
    multibanco: Multibanco,
    redirect: Redirect,
    twint: Twint,
    vipps: Vipps,
    /** Redirect */

    /** Klarna */
    klarna: Klarna,
    klarna_account: Klarna,
    klarna_paynow: Klarna,
    /** Klarna */

    /** QRLoader */
    bcmc_mobile: BcmcMobile,
    bcmc_mobile_QR: BcmcMobile,
    pix: Pix,
    swish: Swish,
    wechatpay: WeChat,
    wechatpayQR: WeChat,
    promptpay: PromptPay,
    paynow: PayNow,
    duitnow: Duitnow,
    /** QRLoader */

    /** Await */
    blik: Blik,
    mbway: MBWay,
    upi: UPI, // also QR
    upi_qr: UPI, // also QR
    upi_collect: UPI, // also QR
    ancv: ANCV,
    /** Await */

    /** Giftcard */
    giftcard: Giftcard,
    mealVoucher_FR_natixis: MealVoucherFR,
    mealVoucher_FR_sodexo: MealVoucherFR,
    mealVoucher_FR_groupeup: MealVoucherFR,
    /** Giftcard */

    default: null
};

/**
 * Instantiates a new Component element either by class reference or by name
 * It also assigns a new uuid to each instance, so we can recognize it during the current session
 * @param componentType - class or componentsMap's key
 * @param props - for the new Component element
 * @returns new PaymentMethod or null
 */
export const getComponent = (componentType, props) => {
    const Component = componentsMap[componentType] || componentsMap.default;
    return Component ? new Component({ ...props, id: `${componentType}-${uuid()}` }) : null;
};

/**
 * Gets the configuration for type from componentsConfig
 * @param type - component type
 * @param componentsConfig - global paymentMethodsConfiguration
 * @returns component configuration
 */
export const getComponentConfiguration = (type: string, componentsConfig = {}, isStoredCard = false) => {
    let pmType = type;
    if (type === 'scheme') {
        pmType = isStoredCard ? 'storedCard' : 'card';
    }

    return componentsConfig[pmType] || {};
};

export default componentsMap;
