import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { IClickToPayService, ShopperCard } from '../services/types';
import { PaymentAmount } from '../../../../../types';

export interface ClickToPayContextInterface
    extends Pick<IClickToPayService, 'checkout' | 'startIdentityValidation' | 'finishIdentityValidation' | 'verifyIfShopperIsEnrolled'> {
    isCtpPrimaryPaymentMethod: boolean;
    setIsCtpPrimaryPaymentMethod(isPrimary: boolean): void;
    logoutShopper(): void;
    ctpState: CtpState;
    cards: ShopperCard[];
    otpMaskedContact: string;
    amount: PaymentAmount;
}

const ClickToPayContext = createContext<ClickToPayContextInterface>({
    amount: null,
    isCtpPrimaryPaymentMethod: null,
    setIsCtpPrimaryPaymentMethod: null,
    logoutShopper: null,
    ctpState: null,
    cards: [],
    otpMaskedContact: null,
    checkout: null,
    verifyIfShopperIsEnrolled: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
