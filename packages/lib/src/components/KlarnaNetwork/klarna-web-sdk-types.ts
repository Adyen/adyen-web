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

export type PresentationInitiateResult = { paymentRequestUrl: string } | { paymentRequestId: string };

export type KlarnaInitiateCallback = (params: KlarnaInitiateParams) => Promise<PresentationInitiateResult>;

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
    off(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
}

export interface Klarna {
    Payment: KlarnaPayment;
}

export type KlarnaSdkFactory = (config: KlarnaSdkConfig) => Promise<Klarna>;
