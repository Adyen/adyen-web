import { createContext } from 'preact';
import { CtpState } from '../../../services/ClickToPayService';
import { ShopperCard, SrciCheckoutResponse } from '../../../services/types';

export interface ClickToPayContextInterface {
    ctpState: CtpState;
    cards: ShopperCard[];
    otpMaskedContact: string;
    checkout(srcDigitalCardId: string, schema: string, srcCorrelationId: string): Promise<SrciCheckoutResponse>;
    startIdentityValidation(): Promise<void>;
    finishIdentityValidation(otpCode: string): Promise<void>;
}

const ClickToPayContext = createContext<ClickToPayContextInterface>({
    ctpState: null,
    cards: [],
    otpMaskedContact: null,
    checkout: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
