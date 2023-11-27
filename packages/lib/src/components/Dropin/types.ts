import { Order, OrderStatus, PaymentActionsType } from '../../types/global-types';
import UIElement from '../internal/UIElement/UIElement';
import { NewableComponent } from '../../core/core.registry';
import { UIElementProps, UIElementStatus } from '../internal/UIElement/types';

/** Components */
import AfterPay from '../AfterPay';
import AfterPayB2B from '../AfterPay/AfterPayB2B';
import AmazonPay from '../AmazonPay';
import ApplePay from '../ApplePay';
import Atome from '../Atome';
import { BillDeskOnline, BillDeskWallet } from '../BillDesk';
import Card from '../Card';
import CashAppPay from '../CashAppPay';
import ClickToPay from '../ClickToPay';
import Bancontact from '../Card/Bancontact';
import Donation from '../Donation';
import Giropay from '../Giropay';
import GooglePay from '../GooglePay';
import Econtext from '../Econtext';
import { FacilyPay3x, FacilyPay4x, FacilyPay6x, FacilyPay10x, FacilyPay12x } from '../FacilyPay';
import Ideal from '../Ideal';
import PayPal from '../PayPal';
import Redirect from '../Redirect';
import CustomCard from '../CustomCard';
import Sepa from '../Sepa';
import WeChat from '../WeChat';
import PayNow from '../PayNow';
import BcmcMobile from '../BcmcMobile';
import { MolPayEBankingMY, MolPayEBankingTH, MolPayEBankingVN } from '../MolPayEBanking';
import Dragonpay from '../Dragonpay';
import Doku from '../Doku';
import Boleto from '../Boleto';
import Oxxo from '../Oxxo';
import Multibanco from '../Multibanco';
import Dotpay from '../Dotpay';
import Eps from '../EPS';
import Giftcard from '../Giftcard';
import Vipps from '../Vipps';
import { PayuCashcard, PayuNetBanking } from '../PayU';
import RatePay from '../RatePay';
import Swish from '../Swish';
import Ach from '../Ach';
import MBWay from '../MBWay';
import Blik from '../Blik';
import BankTransfer from '../BankTransfer';
import Affirm from '../Affirm';
import Pix from '../Pix';
import BacsDD from '../BacsDD';
import Address from '../Address';
import PersonalDetails from '../PersonalDetails';
import Klarna from '../Klarna';
import Twint from '../Twint';
import MealVoucherFR from '../MealVoucherFR';
import OnlineBankingINElement from '../OnlineBankingIN';
import OnlinebankingPL from '../OnlinebankingPL';
import RatePayDirectDebit from '../RatePay/RatePayDirectDebit';
import UPI from '../UPI';
import WalletINElement from '../WalletIN';
import OnlineBankingCZElement from '../OnlineBankingCZ';
import OnlineBankingSKElement from '../OnlineBankingSK';
import PayByBank from '../PayByBank';
import PromptPay from '../PromptPay';
import Duitnow from '../DuitNow';
import Trustly from '../Trustly';
import { TxVariants } from '../tx-variants';

/**
 * Maps each component with a Component element.
 * WARNING: NEVER EXPORT THIS VARIABLE!!! It is only for use by TypeScript, exporting it will break the tree-shaking
 */
const componentsMap = {
    /** internal */
    [TxVariants.address]: Address,
    [TxVariants.bankTransfer_IBAN]: BankTransfer,
    [TxVariants.donation]: Donation,
    [TxVariants.personal_details]: PersonalDetails,
    /** internal */

    /** Card */
    [TxVariants.bcmc]: Bancontact,
    [TxVariants.card]: Card,
    [TxVariants.scheme]: Card,
    [TxVariants.storedCard]: Card,
    [TxVariants.customCard]: CustomCard,
    /** Card */

    /** Direct debit */
    [TxVariants.ach]: Ach,
    [TxVariants.directdebit_GB]: BacsDD,
    [TxVariants.sepadirectdebit]: Sepa,
    /** Direct debit */

    /** Open Invoice */
    [TxVariants.affirm]: Affirm,
    [TxVariants.afterpay]: AfterPay,
    [TxVariants.afterpay_default]: AfterPay,
    [TxVariants.afterpay_b2b]: AfterPayB2B,
    [TxVariants.atome]: Atome,
    [TxVariants.facilypay_3x]: FacilyPay3x,
    [TxVariants.facilypay_4x]: FacilyPay4x,
    [TxVariants.facilypay_6x]: FacilyPay6x,
    [TxVariants.facilypay_10x]: FacilyPay10x,
    [TxVariants.facilypay_12x]: FacilyPay12x,
    [TxVariants.ratepay]: RatePay,
    [TxVariants.ratepay_directdebit]: RatePayDirectDebit,
    /** Open Invoice */

    /** Wallets */
    [TxVariants.amazonpay]: AmazonPay,
    [TxVariants.applepay]: ApplePay,
    [TxVariants.cashapp]: CashAppPay,
    [TxVariants.clicktopay]: ClickToPay,
    [TxVariants.googlepay]: GooglePay,
    [TxVariants.paypal]: PayPal,
    [TxVariants.paywithgoogle]: GooglePay,
    /** Wallets */

    /** Voucher */
    [TxVariants.boletobancario]: Boleto,
    [TxVariants.boletobancario_itau]: Boleto,
    [TxVariants.boletobancario_santander]: Boleto,
    [TxVariants.doku]: Doku,
    [TxVariants.doku_alfamart]: Doku,
    [TxVariants.doku_permata_lite_atm]: Doku,
    [TxVariants.doku_indomaret]: Doku,
    [TxVariants.doku_atm_mandiri_va]: Doku,
    [TxVariants.doku_sinarmas_va]: Doku,
    [TxVariants.doku_mandiri_va]: Doku,
    [TxVariants.doku_cimb_va]: Doku,
    [TxVariants.doku_danamon_va]: Doku,
    [TxVariants.doku_bri_va]: Doku,
    [TxVariants.doku_bni_va]: Doku,
    [TxVariants.doku_bca_va]: Doku,
    [TxVariants.doku_wallet]: Doku,
    [TxVariants.oxxo]: Oxxo,
    [TxVariants.primeiropay_boleto]: Boleto,
    /** Voucher */

    /** issuerList */
    [TxVariants.billdesk_online]: BillDeskOnline,
    [TxVariants.billdesk_wallet]: BillDeskWallet,
    [TxVariants.dotpay]: Dotpay,
    [TxVariants.eps]: Eps,
    [TxVariants.ideal]: Ideal,
    [TxVariants.molpay_ebanking_fpx_MY]: MolPayEBankingMY,
    [TxVariants.molpay_ebanking_TH]: MolPayEBankingTH,
    [TxVariants.molpay_ebanking_VN]: MolPayEBankingVN,
    [TxVariants.onlineBanking_CZ]: OnlineBankingCZElement,
    [TxVariants.onlinebanking_IN]: OnlineBankingINElement, // NOTE ]: the txVariant does have a lowercase "b"
    [TxVariants.onlineBanking_PL]: OnlinebankingPL,
    [TxVariants.onlineBanking_SK]: OnlineBankingSKElement,
    [TxVariants.paybybank]: PayByBank,
    [TxVariants.payu_IN_cashcard]: PayuCashcard,
    [TxVariants.payu_IN_nb]: PayuNetBanking,
    [TxVariants.wallet_IN]: WalletINElement,
    /** issuerList */

    /** Dragonpay */
    [TxVariants.dragonpay_ebanking]: Dragonpay,
    [TxVariants.dragonpay_otc_banking]: Dragonpay,
    [TxVariants.dragonpay_otc_non_banking]: Dragonpay,
    [TxVariants.dragonpay_otc_philippines]: Dragonpay,
    /** Dragonpay */

    /** Econtext */
    [TxVariants.econtext_atm]: Econtext,
    [TxVariants.econtext_online]: Econtext,
    [TxVariants.econtext_seven_eleven]: Econtext,
    [TxVariants.econtext_stores]: Econtext,
    /** Econtext */

    /** Redirect */
    [TxVariants.giropay]: Giropay,
    [TxVariants.multibanco]: Multibanco,
    [TxVariants.redirect]: Redirect,
    [TxVariants.twint]: Twint,
    [TxVariants.vipps]: Vipps,
    [TxVariants.trustly]: Trustly,
    /** Redirect */

    /** Klarna */
    [TxVariants.klarna]: Klarna,
    [TxVariants.klarna_account]: Klarna,
    [TxVariants.klarna_paynow]: Klarna,
    /** Klarna */

    /** QRLoader */
    [TxVariants.bcmc_mobile]: BcmcMobile,
    [TxVariants.bcmc_mobile_QR]: BcmcMobile,
    [TxVariants.pix]: Pix,
    [TxVariants.swish]: Swish,
    [TxVariants.wechatpay]: WeChat,
    [TxVariants.wechatpayQR]: WeChat,
    [TxVariants.promptpay]: PromptPay,
    [TxVariants.paynow]: PayNow,
    [TxVariants.duitnow]: Duitnow,
    /** QRLoader */

    /** Await */
    [TxVariants.blik]: Blik,
    [TxVariants.mbway]: MBWay,
    [TxVariants.upi]: UPI, // also QR
    [TxVariants.upi_qr]: UPI, // also QR
    [TxVariants.upi_collect]: UPI, // also QR
    /** Await */

    /** Giftcard */
    [TxVariants.giftcard]: Giftcard,
    [TxVariants.mealVoucher_FR_natixis]: MealVoucherFR,
    [TxVariants.mealVoucher_FR_sodexo]: MealVoucherFR,
    [TxVariants.mealVoucher_FR_groupeup]: MealVoucherFR
    /** Giftcard */
};

/**
 * Available components
 */
type PaymentMethods = typeof componentsMap;

/**
 * Options for a component
 */
type PaymentMethodOptions<P extends keyof PaymentMethods> = InstanceType<PaymentMethods[P]>['props'];
type PaymentMethodsConfigurationMap = {
    [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
};
type PaymentActionTypesMap = {
    [key in PaymentActionsType]?: Partial<UIElementProps>;
};
/**
 * Type must be loose, otherwise it will take priority over the rest
 */
type NonMappedPaymentMethodsMap = {
    [key: string]: any;
};

export type PaymentMethodsConfiguration = PaymentMethodsConfigurationMap & PaymentActionTypesMap & NonMappedPaymentMethodsMap;

export type InstantPaymentTypes = 'paywithgoogle' | 'googlepay' | 'applepay';

export interface DropinConfiguration extends UIElementProps {
    /**
     * Configure each payment method displayed on the Drop-in
     */
    paymentMethodsConfiguration?: PaymentMethodsConfiguration;

    /**
     * Pass the payment method classes that are going to be used as part of the Drop-in.
     */
    paymentMethodComponents?: NewableComponent[];

    order?: Order;

    /**
     * Show/Hide stored payment methods
     * @defaultValue true
     */
    showStoredPaymentMethods?: boolean;

    /**
     * Show/Hide regular (non-stored) payment methods
     * @defaultValue true
     */
    showPaymentMethods?: boolean;

    /**
     * Show wallet payment methods to show on top of the regular payment
     * method list.
     *
     * @defaultValue []
     */
    instantPaymentTypes?: InstantPaymentTypes[];

    openFirstStoredPaymentMethod?: boolean;
    openFirstPaymentMethod?: boolean;
    onSubmit?: (data, component) => void;
    onReady?: () => void;
    onSelect?: (paymentMethod: UIElement) => void;

    /**
     * Show/Hide the remove payment method button on stored payment methods
     * Requires {@link DropinConfiguration.onDisableStoredPaymentMethod}
     * @defaultValue false
     */
    showRemovePaymentMethodButton?: boolean;

    /**
     * Called when a shopper clicks Remove on a stored payment method
     * Use this to call the {@link https://docs.adyen.com/api-explorer/#/Recurring/v49/post/disable /disable endpoint}
     * Call resolve() if the removal was successful, or call reject() if there was an error
     * @defaultValue false
     */
    onDisableStoredPaymentMethod?: (storedPaymentMethod, resolve, reject) => void;
}

export interface onOrderCancelData {
    order: Order;
}

export interface DropinComponentProps extends DropinConfiguration {
    onCreateElements: any;
    onChange: (newState?: object) => void;
    onOrderCancel?: (data: onOrderCancelData) => void;
}

interface DropinStatus {
    type: UIElementStatus;
    props?: DropinStatusProps;
}

export interface DropinStatusProps {
    component?: UIElement;
}

export interface DropinComponentState {
    elements: any[];
    instantPaymentElements: UIElement[];
    storedPaymentElements: UIElement[];
    status: DropinStatus;
    activePaymentMethod: UIElement;
    cachedPaymentMethods: object;
    isDisabling: boolean;
    orderStatus: OrderStatus;
}
