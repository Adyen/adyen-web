import { CtpState } from './ClickToPayService';
import { SrcProfile } from './sdks/types';
import { ClickToPayScheme } from '../../../types';
import ShopperCard from '../models/ShopperCard';

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    shopperValidationContact: string;
    initialize(): Promise<void>;
    checkout(card: ShopperCard): Promise<CheckoutPayload>;
    logout(): Promise<void>;
    verifyIfShopperIsEnrolled(value: string, type?: string): Promise<{ isEnrolled: boolean }>;
    subscribeOnStateChange(callback: CallbackStateSubscriber): void;
    startIdentityValidation(): Promise<void>;
    finishIdentityValidation(otpCode: string): Promise<void>;
}

export type CallbackStateSubscriber = (state: CtpState) => void;

export interface IdentityLookupParams {
    value: string;
    type: string;
}

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

export interface SrcProfileWithScheme extends SrcProfile {
    scheme: ClickToPayScheme;
}

export type CheckoutPayload = VisaCheckout | MastercardCheckout;
