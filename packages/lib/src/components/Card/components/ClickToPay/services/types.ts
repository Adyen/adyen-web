import { CtpState } from './ClickToPayService';
import { SrcInitParams, SrcProfile } from './sdks/types';
import { ClickToPayScheme } from '../../../types';
import ShopperCard from '../models/ShopperCard';

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    identityValidationData: IdentityValidationData;
    schemes: string[];
    initialize(): Promise<void>;
    checkout(card: ShopperCard): Promise<ClickToPayCheckoutPayload>;
    logout(): Promise<void>;
    verifyIfShopperIsEnrolled(value: string, type?: string): Promise<{ isEnrolled: boolean }>;
    subscribeOnStateChange(callback: CallbackStateSubscriber): void;
    startIdentityValidation(): Promise<void>;
    finishIdentityValidation(otpCode: string): Promise<void>;
}

export type IdentityValidationData = {
    maskedShopperContact: string;
    selectedNetwork: string;
};

export type CallbackStateSubscriber = (state: CtpState) => void;

export interface IdentityLookupParams {
    value: string;
    type?: 'email' | 'mobilePhone';
}

export type MastercardCheckout = {
    srcDigitalCardId: string;
    srcCorrelationId: string;
    srcScheme: string;
};

export type VisaCheckout = {
    srcCheckoutPayload?: string;
    srcTokenReference?: string;
    srcCorrelationId: string;
    srcScheme: string;
};

export interface SrcProfileWithScheme extends SrcProfile {
    scheme: ClickToPayScheme;
}

export type CardTypes = {
    availableCards: ShopperCard[];
    expiredCards: ShopperCard[];
};

export type SchemesConfiguration = Partial<Record<ClickToPayScheme, SrcInitParams>>;

export type ClickToPayCheckoutPayload = VisaCheckout | MastercardCheckout;
