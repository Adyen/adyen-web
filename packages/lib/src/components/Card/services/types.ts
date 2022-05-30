import { CtpState } from './ClickToPayService';

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    shopperValidationContact: string;
    initialize(): Promise<void>;
    subscribeOnStateChange(callback: CallbackStateSubscriber): void;
    checkout(card: ShopperCard): Promise<CheckoutPayload>;
    startIdentityValidation(): Promise<void>;
    finishIdentityValidation(otpCode: string): Promise<void>;
}

export type CallbackStateSubscriber = (state: CtpState) => void;

export interface IdentityLookupParams {
    value: string;
    type: string;
}

export type ShopperCard = {
    dateOfCardLastUsed: string;
    panLastFour: string;
    srcDigitalCardId: string;
    cardTitle: string;
    paymentCardDescriptor: string;
    srcCorrelationId: string;
    tokenId?: string;
};

type MastercardCheckout = {
    digitalCardId: string;
    correlationId: string;
    scheme: string;
};

type VisaCheckout = {
    tokenId?: string;
    checkoutPayload?: string;
    scheme: string;
};

export type CheckoutPayload = VisaCheckout | MastercardCheckout;
