import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { IClickToPayService, ShopperCard } from '../services/types';

export interface ClickToPayContextInterface extends Pick<IClickToPayService, 'checkout' | 'startIdentityValidation' | 'finishIdentityValidation'> {
    ctpState: CtpState;
    cards: ShopperCard[];
    otpMaskedContact: string;
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
