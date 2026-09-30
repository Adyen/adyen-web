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

/*
 * Express (shipping) shapes below are not confirmed against the Klarna SDK yet and are validated at runtime in the POC.
 */
export type KlarnaShippingMode = 'EDITABLE' | 'READ_ONLY';

export interface KlarnaShippingConfig {
    mode: KlarnaShippingMode;
}

export interface KlarnaShippingAddress {
    givenName?: string;
    familyName?: string;
    streetAddress?: string;
    streetAddress2?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
}

export interface KlarnaShippingOption {
    shippingOptionReference: string;
    displayName: string;
    description?: string;
    amount: number;
    shippingType: string;
}

export interface KlarnaLineItem {
    name: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    totalTaxAmount?: number;
    taxRate?: number;
    reference?: string;
    imageUrl?: string;
    productUrl?: string;
}

export interface KlarnaShippingUpdatePayload {
    amount: number;
    currency: string;
    lineItems?: KlarnaLineItem[];
    shippingOptions?: KlarnaShippingOption[];
    selectedShippingOptionReference?: string;
}

export interface KlarnaShippingRejection {
    rejectionReason: string;
}

export type KlarnaShippingHandlerResult = Promise<KlarnaShippingUpdatePayload | KlarnaShippingRejection>;

export type KlarnaShippingAddressChangeHandler = (paymentRequest: unknown, address: KlarnaShippingAddress) => KlarnaShippingHandlerResult;

export type KlarnaShippingOptionSelectHandler = (paymentRequest: unknown, option: KlarnaShippingOption) => KlarnaShippingHandlerResult;

export interface KlarnaPaymentRequest {
    update(data: { shippingConfig: KlarnaShippingConfig }): Promise<unknown>;
}

export interface KlarnaPayment {
    presentation(data: { amount?: number; currency: string; locale?: string; intent?: string }): Promise<PaymentPresentation | undefined>;
    fetch(paymentRequestUrl: string): Promise<{ paymentRequestId?: string } | undefined>;
    /** From step 12 of Klarna's Express diagram. Not in SDK v2.0.420 yet, so calling it throws a TypeError. */
    request(paymentRequestId: string): KlarnaPaymentRequest;
    on(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
    on(event: 'error', callback: (error: KlarnaPaymentError | Error, paymentRequest?: unknown) => void): unknown;
    on(event: 'shippingaddresschange', callback: KlarnaShippingAddressChangeHandler): unknown;
    on(event: 'shippingoptionselect', callback: KlarnaShippingOptionSelectHandler): unknown;
    off(event: 'complete', callback: (paymentRequest: unknown) => void): unknown;
    off(event: 'error', callback: (error: KlarnaPaymentError | Error, paymentRequest?: unknown) => void): unknown;
    off(event: 'shippingaddresschange', callback: KlarnaShippingAddressChangeHandler): unknown;
    off(event: 'shippingoptionselect', callback: KlarnaShippingOptionSelectHandler): unknown;
}

export interface Klarna {
    Payment: KlarnaPayment;
}

export type KlarnaSdkFactory = (config: KlarnaSdkConfig) => Promise<Klarna>;
