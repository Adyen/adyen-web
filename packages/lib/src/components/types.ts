import { h } from 'preact';
import { Order, PaymentAction, PaymentAmount, PaymentAmountExtended } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Analytics from '../core/Analytics';
import RiskElement from '../core/RiskModule';
import { PayButtonProps } from './internal/PayButton/PayButton';
import Session from '../core/CheckoutSession';
import { SRPanel } from '../core/Errors/SRPanel';
import { Resources } from '../core/Context/Resources';

/** Components */
import AfterPay from './AfterPay';
import AfterPayB2B from './AfterPay/AfterPayB2B';
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
import Econtext from './Econtext';
import { FacilyPay3x, FacilyPay4x, FacilyPay6x, FacilyPay10x, FacilyPay12x } from './FacilyPay';
import Ideal from './Ideal';
import PayPal from './PayPal';
import Redirect from './Redirect';
import CustomCard from './CustomCard';
import Sepa from './Sepa';
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
import Ach from './Ach';
import MBWay from './MBWay';
import Blik from './Blik';
import BankTransfer from './BankTransfer';
import Affirm from './Affirm';
import Pix from './Pix';
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
import Trustly from './Trustly';
import { TxVariants } from './tx-variants';
import { PaymentActionsType } from '../types';
import { ICore } from '../core/types';

/**
 * Maps each component with a Component element.
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

export type PaymentMethodsConfiguration =
    | {
          [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
      }
    | {
          [key in PaymentActionsType]?: any;
      }
    | {
          [key: string]: any;
      };

export interface PaymentMethodData {
    paymentMethod: {
        [key: string]: any;
        checkoutAttemptId?: string;
    };
    browserInfo?: {
        acceptHeader: string;
        colorDepth: number;
        javaEnabled: boolean;
        language: string;
        screenHeight: number;
        screenWidth: number;
        timeZoneOffset: number;
        userAgent: string;
    };
}

/**
 * Represents the payment data that will be submitted to the /payments endpoint
 */
export interface PaymentData extends PaymentMethodData {
    riskData?: {
        clientData: string;
    };
    order?: {
        orderData: string;
        pspReference: string;
    };
    clientStateDataIndicator: boolean;
    sessionData?: string;
    storePaymentMethod?: boolean;
}

export type ResultCode =
    | 'AuthenticationFinished'
    | 'AuthenticationNotRequired'
    | 'Authorised'
    | 'Cancelled'
    | 'ChallengeShopper'
    | 'Error'
    | 'IdentifyShopper'
    | 'PartiallyAuthorised'
    | 'Pending'
    | 'PresentToShopper'
    | 'Received'
    | 'RedirectShopper'
    | 'Refused';

export interface OnPaymentCompletedData {
    sessionData: string;
    sessionResult: string;
    resultCode: ResultCode;
}

export interface PaymentResponse {
    action?: PaymentAction;
    resultCode: string;
    sessionData?: string;
    sessionResult?: string;
    order?: Order;
}

export interface RawPaymentResponse extends PaymentResponse {
    [key: string]: any;
}

export interface BaseElementProps {
    core: ICore;
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: Analytics;
        resources?: Resources;
        risk?: RiskElement;
    };
    isDropin?: boolean;
}

export interface IUIElement {
    isValid: boolean;
    displayName: string;
    accessibleName: string;
    type: string;
    elementRef: any;
    submit(): void;
    setElementStatus(status: UIElementStatus, props: any): UIElement;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    handleAction(action: PaymentAction): UIElement | null;
    showValidation(): void;
    setState(newState: object): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';
export type ActionDescriptionType = 'qr-code-loaded' | 'polling-started' | 'fingerprint-iframe-loaded' | 'challenge-iframe-loaded';

export type PayButtonFunctionProps = Omit<PayButtonProps, 'amount'>;

export interface ActionHandledReturnObject {
    componentType: string;
    actionDescription: ActionDescriptionType;
}

export interface UIElementProps extends BaseElementProps {
    environment?: string;
    session?: Session;
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    onPaymentCompleted?: (result: any, element: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    isInstantPayment?: boolean;

    /**
     * Flags if the element is Stored payment method
     * @internal
     */
    isStoredPaymentMethod?: boolean;

    /**
     * Flag if the element is Stored payment method.
     * Perhaps can be deprecated and we use the one above?
     * @internal
     */
    oneClick?: boolean;

    /**
     * Stored payment method id
     * @internal
     */
    storedPaymentMethodId?: string;

    /**
     * Status set when creating the Component from action
     * @internal
     */
    statusType?: 'redirect' | 'loading' | 'custom';

    type?: string;
    name?: string;
    icon?: string;
    amount?: PaymentAmount;
    secondaryAmount?: PaymentAmountExtended;

    /**
     * Show/Hide pay button
     * @defaultValue true
     */
    showPayButton?: boolean;

    /**
     *  Set to false to not set the Component status to 'loading' when onSubmit is triggered.
     *  @defaultValue true
     */
    setStatusAutomatically?: boolean;

    /** @internal */
    payButton?: (options: PayButtonFunctionProps) => h.JSX.Element;

    /** @internal */
    loadingContext?: string;

    /** @internal */
    createFromAction?: (action: PaymentAction, props: object) => UIElement;

    /** @internal */
    clientKey?: string;

    /** @internal */
    elementRef?: any;

    /** @internal */
    i18n?: Language;
}

export interface AwaitActionElement extends UIElementProps {
    paymentData?: string;
    paymentMethodType?: string;
    type?: string;
    url?: string;
}

export interface VoucherActionElement extends UIElementProps {
    reference?: string;
    url?: string;
    paymentMethodType?: string;
}

// An interface for the members exposed by a component to its parent UIElement
export interface ComponentMethodsRef {
    showValidation?: () => void;
    setStatus?(status: UIElementStatus): void;
}
