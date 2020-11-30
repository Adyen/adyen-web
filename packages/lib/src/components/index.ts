import { AfterPay, AfterPayB2B } from './AfterPay';
import ApplePay from './ApplePay';
import { BillDeskOnline, BillDeskWallet } from './BillDesk';
import Card from './Card';
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
import BcmcMobile from './BcmcMobile';
import { MolPayEBankingMY, MolPayEBankingTH, MolPayEBankingVN } from './MolPayEBanking';
import OpenBankingUK from './OpenBankingUK';
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
import uuid from '../utils/uuid';
import Affirm from './Affirm';

/**
 * Maps each component with a Component element.
 */
const componentsMap = {
    dropin: Dropin,
    ach: Ach,
    afterpay: AfterPay,
    afterpay_default: AfterPay,
    afterpay_b2b: AfterPayB2B,
    amex: Card,
    applepay: ApplePay,
    bcmc: Bancontact,
    bcmc_mobile: BcmcMobile,
    bcmc_mobile_QR: BcmcMobile,
    blik: Blik,
    billdesk_online: BillDeskOnline,
    billdesk_wallet: BillDeskWallet,
    boletobancario: Boleto,
    boletobancario_bancodobrasil: Boleto,
    boletobancario_bradesco: Boleto,
    boletobancario_hsbc: Boleto,
    boletobancario_itau: Boleto,
    boletobancario_santander: Boleto,
    primeiropay_boleto: Boleto,
    card: Card,
    diners: Card,
    discover: Card,
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
    donation: Donation,
    dotpay: Dotpay,
    dragonpay_ebanking: Dragonpay,
    dragonpay_otc_banking: Dragonpay,
    dragonpay_otc_non_banking: Dragonpay,
    dragonpay_otc_philippines: Dragonpay,
    econtext_seven_eleven: Econtext,
    econtext_atm: Econtext,
    econtext_stores: Econtext,
    econtext_online: Econtext,
    entercash: Entercash,
    eps: Eps,
    facilypay_3x: FacilyPay3x,
    facilypay_4x: FacilyPay4x,
    facilypay_6x: FacilyPay6x,
    facilypay_10x: FacilyPay10x,
    facilypay_12x: FacilyPay12x,
    giropay: Giropay,
    ideal: Ideal,
    jcb: Card,
    kcp: Card,
    maestro: Card,
    mbway: MBWay,
    mc: Card,
    molpay_ebanking_fpx_MY: MolPayEBankingMY,
    molpay_ebanking_TH: MolPayEBankingTH,
    molpay_ebanking_VN: MolPayEBankingVN,
    openbanking_UK: OpenBankingUK,
    paypal: PayPal,
    payu_IN_cashcard: PayuCashcard,
    payu_IN_nb: PayuNetBanking,
    paywithgoogle: GooglePay,
    qiwiwallet: QiwiWallet,
    ratepay: RatePay,
    redirect: Redirect,
    securedfields: SecuredFields,
    sepadirectdebit: Sepa,
    scheme: Card,
    threeDS2Challenge: ThreeDS2Challenge,
    threeDS2DeviceFingerprint: ThreeDS2DeviceFingerprint,
    visa: Card,
    wechatpay: WeChat,
    wechatpayQR: WeChat,
    oxxo: Oxxo,
    multibanco: Multibanco,
    giftcard: Giftcard,
    vipps: Vipps,
    swish: Swish,
    affirm: Affirm,
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
export const getComponentConfiguration = (type: string, componentsConfig = {}) => {
    const pmType = type === 'scheme' ? 'card' : type;
    return componentsConfig[pmType] || {};
};

export default componentsMap;
