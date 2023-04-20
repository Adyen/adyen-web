import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../services/types';
import { PaymentAmount } from '../../../../../types';
import ShopperCard from '../models/ShopperCard';
import { UIElementStatus } from '../../../../types';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';
import { ClickToPayConfiguration } from '../../../types';

export interface IClickToPayContext
    extends Pick<IClickToPayService, 'checkout' | 'startIdentityValidation' | 'finishIdentityValidation' | 'verifyIfShopperIsEnrolled'> {
    isCtpPrimaryPaymentMethod: boolean;
    setIsCtpPrimaryPaymentMethod(isPrimary: boolean): void;
    logoutShopper(): void;
    ctpState: CtpState;
    cards: ShopperCard[];
    schemes: string[];
    otpMaskedContact: string;
    otpNetwork: string;
    amount: PaymentAmount;
    configuration: ClickToPayConfiguration;
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
    configuration: null,
    isCtpPrimaryPaymentMethod: null,
    setIsCtpPrimaryPaymentMethod: null,
    logoutShopper: null,
    ctpState: null,
    cards: [],
    schemes: [],
    otpMaskedContact: null,
    otpNetwork: null,
    checkout: null,
    verifyIfShopperIsEnrolled: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
