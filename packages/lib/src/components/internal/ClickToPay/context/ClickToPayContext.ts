import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../services/types';
import ShopperCard from '../models/ShopperCard';
import { ClickToPayProps } from '../types';
import { PaymentAmount } from '../../../../types/global-types';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from '../../UIElement/types';

export interface IClickToPayContext
    extends Pick<IClickToPayService, 'checkout' | 'startIdentityValidation' | 'finishIdentityValidation' | 'verifyIfShopperIsEnrolled'> {
    isStandaloneComponent: boolean;
    isCtpPrimaryPaymentMethod: boolean;
    isStoringCookies: boolean;
    setIsCtpPrimaryPaymentMethod(isPrimary: boolean): void;
    logoutShopper(): Promise<void>;
    updateStoreCookiesConsent(shouldStore: boolean): void;
    ctpState: CtpState;
    cards: ShopperCard[];
    schemes: string[];
    otpMaskedContact: string;
    otpNetwork: string;
    amount: PaymentAmount;
    configuration: ClickToPayProps;
    status: UIElementStatus;
    onSubmit(payload: ClickToPayCheckoutPayload): void;
    onSetStatus(status: UIElementStatus): void;
    onError(error: AdyenCheckoutError): void;
    onReady(): void;
}

const ClickToPayContext = createContext<IClickToPayContext>({
    status: null,
    onSubmit: null,
    onSetStatus: null,
    onError: null,
    onReady: null,
    amount: null,
    configuration: null,
    isStandaloneComponent: null,
    isCtpPrimaryPaymentMethod: null,
    isStoringCookies: false,
    setIsCtpPrimaryPaymentMethod: null,
    logoutShopper: null,
    updateStoreCookiesConsent: null,
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
