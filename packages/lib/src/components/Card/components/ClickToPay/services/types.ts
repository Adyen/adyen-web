import { CtpState } from './ClickToPayService';
import { SrcProfile } from './sdks/types';
import { ClickToPayScheme } from '../../../types';
import ShopperCard from '../models/ShopperCard';

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    shopperValidationContact: string;
    schemes: string[];
    initialize(): Promise<void>;
    checkout(card: ShopperCard): Promise<ClickToPayCheckoutPayload>;
    logout(): Promise<void>;
    verifyIfShopperIsEnrolled(value: string, type?: string): Promise<{ isEnrolled: boolean }>;
    subscribeOnStateChange(callback: CallbackStateSubscriber): void;
    startIdentityValidation(): Promise<void>;
    finishIdentityValidation(otpCode: string): Promise<void>;
}

export type CallbackStateSubscriber = (state: CtpState) => void;

export interface IdentityLookupParams {
    value: string;
    type?: 'email' | 'mobilePhone';
}

type MastercardCheckout = {
    srcDigitalCardId: string;
    srcCorrelationId: string;
    srcScheme: string;
};

type VisaCheckout = {
    srcCheckoutPayload?: string;
    srcTokenReference?: string;
    srcScheme: string;
};

export interface SrcProfileWithScheme extends SrcProfile {
    scheme: ClickToPayScheme;
}

export type ClickToPayCheckoutPayload = VisaCheckout | MastercardCheckout;
