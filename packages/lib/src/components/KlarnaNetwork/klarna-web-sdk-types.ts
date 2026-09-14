/**
 * Hand-written subset of the Klarna Network Distribution Web SDK surface used by the
 * KlarnaNetwork component. Klarna does not publish types on npm, and the SDK may not be
 * bundled, so the shapes below mirror the reference documentation.
 *
 * @see https://docs.klarna.com/websdk/v2/
 */

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/klarna.SDKConfig.html
 */
export interface KlarnaSdkConfig {
    clientId: string;
    products?: string[];
    partnerAccountId?: string;
    acquiringConfig?: { paymentAccountId?: string };
    locale?: string;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/common.KlarnaUIElement.html
 */
export interface KlarnaUIElement {
    htmlElement: HTMLElement;
    mount(container: string | HTMLElement): this;
    unmount(): this;
}

/**
 * Parameters handed to the `initiate` callback registered on a presentation payment button.
 *
 * @see https://docs.klarna.com/websdk/v2/types/payment.PresentationInitiateCallback.html
 */
export interface KlarnaInitiateParams {
    klarnaNetworkSessionToken: string;
    paymentOptionId?: string;
}

/**
 * The subset of the `initiate` return union this component produces: either a payment request URL
 * for Klarna to continue from, or an empty object when the payment is already finalised.
 */
export type PresentationInitiateResult = { paymentRequestUrl: string } | Record<string, never>;

export type KlarnaInitiateCallback = (params: KlarnaInitiateParams) => Promise<PresentationInitiateResult>;

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.KlarnaPaymentButtonConfig.html
 */
export interface KlarnaPaymentButtonConfig {
    intent?: string;
    initiate: KlarnaInitiateCallback;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.PaymentPresentation.html
 */
export interface KlarnaPaymentOption {
    paymentOptionId: string;
    message?: { component(): KlarnaUIElement };
    paymentButton: { component(config: KlarnaPaymentButtonConfig): KlarnaUIElement };
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.PaymentPresentation.html
 */
export interface PaymentPresentation {
    paymentOption?: KlarnaPaymentOption;
}

/**
 * @see https://docs.klarna.com/websdk/v2/interfaces/payment.KlarnaPayment.html
 */
export interface KlarnaPayment {
    presentation(data: { amount?: number; currency: string; locale?: string; intent?: string }): Promise<PaymentPresentation | undefined>;
    on(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
    off(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
}

export interface Klarna {
    Payment: KlarnaPayment;
}

/** The `KlarnaSDK` factory exported by `klarna.mjs`. */
export type KlarnaSdkFactory = (config: KlarnaSdkConfig) => Promise<Klarna>;
