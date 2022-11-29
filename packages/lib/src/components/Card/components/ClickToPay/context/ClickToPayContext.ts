import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../services/types';
import { PaymentAmount } from '../../../../../types';
import ShopperCard from '../models/ShopperCard';
import { UIElementStatus } from '../../../../types';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';

export interface IClickToPayContext
    extends Pick<IClickToPayService, 'checkout' | 'startIdentityValidation' | 'finishIdentityValidation' | 'verifyIfShopperIsEnrolled'> {
    isCtpPrimaryPaymentMethod: boolean;
    setIsCtpPrimaryPaymentMethod(isPrimary: boolean): void;
    logoutShopper(): void;
    ctpState: CtpState;
    cards: ShopperCard[];
    schemes: string[];
    otpMaskedContact: string;
    amount: PaymentAmount;
    status: UIElementStatus;
    onSubmit(payload: ClickToPayCheckoutPayload): void;
    onSetStatus(status: UIElementStatus): void;
    onError(error: AdyenCheckoutError): void;
}

const ClickToPayContext = createContext<IClickToPayContext>({
    status: null,
    onSubmit: null,
    onSetStatus: null,
    onError: null,
    amount: null,
    isCtpPrimaryPaymentMethod: null,
    setIsCtpPrimaryPaymentMethod: null,
    logoutShopper: null,
    ctpState: null,
    cards: [],
    schemes: [],
    otpMaskedContact: null,
    checkout: null,
    verifyIfShopperIsEnrolled: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
