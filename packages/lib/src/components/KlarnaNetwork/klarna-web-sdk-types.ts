export interface KlarnaSdkConfig {
    clientId: string;
    products?: string[];
    partnerAccountId?: string;
    acquiringConfig?: { paymentAccountId?: string };
    locale?: string;
}

export interface KlarnaUIElement {
    htmlElement: HTMLElement;
    mount(container: string | HTMLElement): this;
    unmount(): this;
}

export interface KlarnaInitiateParams {
    klarnaNetworkSessionToken: string;
    paymentOptionId?: string;
}

/**
 * Shapes the Klarna SDK accepts back from the 'initiate' callback, see
 * https://docs.klarna.com/websdk/v2/types/payment.InitiateCallback.html
 */
export type KlarnaInitiateResult = { paymentRequestUrl: string } | { paymentRequestId: string } | { returnUrl?: string };

export type KlarnaInitiateCallback = (params: KlarnaInitiateParams) => Promise<KlarnaInitiateResult>;

export interface KlarnaPaymentError {
    errorCode?: string;
    errorMessage?: string;
}

export interface KlarnaPaymentButtonConfig {
    intent?: string;
    initiate: KlarnaInitiateCallback;
}

export interface KlarnaPaymentOption {
    paymentOptionId: string;
    message?: { component(): KlarnaUIElement };
    paymentButton: { component(config: KlarnaPaymentButtonConfig): KlarnaUIElement };
}

export interface PaymentPresentation {
    paymentOption?: KlarnaPaymentOption;
}

export interface KlarnaPayment {
    presentation(data: { amount?: number; currency: string; locale?: string; intent?: string }): Promise<PaymentPresentation | undefined>;
    on(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
    on(event: 'error', callback: (error: KlarnaPaymentError | Error, paymentRequest?: unknown) => void): unknown;
    off(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
    off(event: 'error', callback: (error: KlarnaPaymentError | Error, paymentRequest?: unknown) => void): unknown;
}

export interface Klarna {
    Payment: KlarnaPayment;
}

export type KlarnaSdkFactory = (config: KlarnaSdkConfig) => Promise<Klarna>;
