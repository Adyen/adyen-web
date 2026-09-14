/**
 * Hand-written subset of the Klarna Network Distribution Web SDK surface used by the
 * KlarnaNetwork component. Klarna does not publish types on npm, and the SDK may not be
 * bundled, so the shapes below mirror the reference documentation.
 *
 * @see https://docs.klarna.com/websdk/v2/
 */

export type KlarnaProduct = 'PAYMENT' | 'CUSTOMER' | 'IDENTITY' | 'MESSAGING';

export type KlarnaIntent = 'PAY' | 'SUBSCRIBE' | 'ADD_TO_WALLET';

export type KlarnaPresentationInstruction = 'SHOW_KLARNA' | 'PRESELECT_KLARNA' | 'SHOW_ONLY_KLARNA' | 'HIDE_KLARNA';

export type KlarnaPaymentStatus = 'PENDING_PARTNER_AUTHORIZATION' | 'REQUIRES_CUSTOMER_ACTION';

export type KlarnaInitiationMode = 'DEVICE_BEST' | 'REDIRECT' | 'ON_PAGE' | 'POPUP';

export type KlarnaButtonTheme = 'default' | 'light' | 'dark' | 'outlined';

export type KlarnaButtonShape = 'default' | 'pill' | 'rect';

export type KlarnaButtonLogoAlignment = 'default' | 'left' | 'center';

export type KlarnaIconShape = 'default' | 'badge' | 'rectangle' | 'square';

/**
 * @see https://docs.klarna.com/websdk/v2/types/common.AcquiringConfig.html
 */
export interface KlarnaAcquiringConfig {
    paymentAccountId?: string;
    settlementCurrency?: string;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/klarna.SDKConfig.html
 */
export interface KlarnaSdkConfig {
    clientId: string;
    products?: KlarnaProduct[];
    partnerAccountId?: string;
    acquiringConfig?: KlarnaAcquiringConfig;
    klarnaNetworkSessionToken?: string;
    locale?: string;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/common.KlarnaUIElement.html
 */
export interface KlarnaUIElement {
    htmlElement: HTMLElement;
    id?: string;
    mount(container: string | HTMLElement): this;
    unmount(): this;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.KlarnaPaymentButton.html
 */
export interface KlarnaPaymentButton extends KlarnaUIElement {
    toggleState(state: 'disabled' | 'loading', value?: boolean): this;
}

/**
 * Parameters handed to the `initiate` callback.
 *
 * `paymentOptionId` is present when the callback is registered on a presentation payment button
 * and absent when it is passed straight to `Payment.initiate()`.
 *
 * @see https://docs.klarna.com/websdk/v2/types/payment.PresentationInitiateCallback.html
 */
export interface KlarnaInitiateParams {
    klarnaNetworkSessionToken: string;
    paymentOptionId?: string;
    acquiringConfig?: KlarnaAcquiringConfig;
}

/**
 * The subset of the `initiate` return union this component produces: either a payment request URL
 * for Klarna to continue from, or an empty object when the payment is already finalised.
 */
export type PresentationInitiateResult = { paymentRequestUrl: string } | { returnUrl?: string };

export type KlarnaInitiateCallback = (params: KlarnaInitiateParams) => Promise<PresentationInitiateResult>;

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.KlarnaPaymentButtonConfig.html
 */
export interface KlarnaPaymentButtonConfig {
    id?: string;
    disabled?: boolean;
    loading?: boolean;
    hideOverlay?: boolean;
    locale?: string;
    intent?: KlarnaIntent;
    initiationMode?: KlarnaInitiationMode;
    theme?: KlarnaButtonTheme;
    shape?: KlarnaButtonShape;
    logoAlignment?: KlarnaButtonLogoAlignment;
    initiate?: KlarnaInitiateCallback;
}

/**
 * A single Klarna payment option, returned as either `paymentOption` or `savedPaymentOption`.
 *
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.PaymentPresentation.html
 */
export interface KlarnaPaymentOption {
    paymentOptionId: string;
    icon: { component(config: { shape: KlarnaIconShape }): KlarnaUIElement };
    header: { component(): KlarnaUIElement };
    subheader: { component(): KlarnaUIElement };
    badge?: { component(): KlarnaUIElement };
    message?: { component(): KlarnaUIElement };
    terms?: { component(): KlarnaUIElement };
    paymentButton: { component(config: KlarnaPaymentButtonConfig): KlarnaPaymentButton };
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.PaymentPresentationData.html
 */
export interface PaymentPresentationData {
    amount?: number;
    currency: string;
    locale?: string;
    intent?: KlarnaIntent;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.PaymentPresentation.html
 */
export interface PaymentPresentation {
    instruction: KlarnaPresentationInstruction;
    paymentStatus: KlarnaPaymentStatus;
    paymentOption?: KlarnaPaymentOption;
    savedPaymentOption?: KlarnaPaymentOption;
}

export type KlarnaPaymentEvent = 'complete' | 'abort' | 'error';

export type KlarnaPaymentEventHandler = (...args: unknown[]) => void | Promise<void>;

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.KlarnaPayment.html
 */
export interface KlarnaPayment {
    presentation(data: PaymentPresentationData): Promise<PaymentPresentation | undefined>;
    initiate(callback: KlarnaInitiateCallback, options?: { initiationMode?: KlarnaInitiationMode }): Promise<unknown>;
    on(event: KlarnaPaymentEvent, callback: KlarnaPaymentEventHandler): unknown;
    off(event: KlarnaPaymentEvent, callback: KlarnaPaymentEventHandler): unknown;
}

export interface Klarna {
    Payment: KlarnaPayment;
}

/** The `KlarnaSDK` factory exported by `klarna.mjs`. */
export type KlarnaSdkFactory = (config: KlarnaSdkConfig) => Promise<Klarna>;
