import { CtpState } from './ClickToPayService';
import { SrciCheckoutResponse } from './sdks/types';

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    shopperValidationContact: string;
    initialize(): Promise<void>;
    subscribeOnStateChange(callback: CallbackStateSubscriber): void;
    checkout(srcDigitalCardId: string, schema: string, srcCorrelationId: string): Promise<SrciCheckoutResponse>;
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
};
