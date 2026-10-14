import { createContext } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../services/types';
import ShopperCard from '../models/ShopperCard';
import { ClickToPayProps } from '../types';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from '../../UIElement/types';

export interface IClickToPayContext extends Pick<
    IClickToPayService,
    'checkout' | 'startIdentityValidation' | 'finishIdentityValidation' | 'verifyIfShopperIsEnrolled'
> {
    isStandaloneComponent: boolean;
    isCtpPrimaryPaymentMethod: boolean;
    isStoringCookies: boolean;
    setIsCtpPrimaryPaymentMethod(isPrimary: boolean): void;
    logoutShopper(): Promise<void>;
    updateStoreCookiesConsent(shouldStore: boolean): void;
    ctpState: CtpState;
    cards: ShopperCard[];
    schemes: string[];
    otpMaskedContact: string | undefined;
    otpNetwork: string | undefined;
    configuration: ClickToPayProps;
    status: UIElementStatus;
    onSubmit(payload: ClickToPayCheckoutPayload): void;
    onSetStatus(status: UIElementStatus): void;
    onError(error: AdyenCheckoutError): void;
    onReady(): void;
}

const noop = (): void => undefined;

const ClickToPayContext = createContext<IClickToPayContext>({
    status: 'ready',
    onSubmit: noop,
    onSetStatus: noop,
    onError: noop,
    onReady: noop,
    configuration: {},
    isStandaloneComponent: false,
    isCtpPrimaryPaymentMethod: true,
    isStoringCookies: false,
    setIsCtpPrimaryPaymentMethod: noop,
    logoutShopper: () => Promise.resolve(),
    updateStoreCookiesConsent: noop,
    ctpState: CtpState.NotAvailable,
    cards: [],
    schemes: [],
    otpMaskedContact: undefined,
    otpNetwork: undefined,
    checkout: () => Promise.reject(new AdyenCheckoutError('ERROR', 'ClickToPay checkout is not available')),
    verifyIfShopperIsEnrolled: () => Promise.reject(new AdyenCheckoutError('ERROR', 'ClickToPay is not available')),
    startIdentityValidation: () => Promise.reject(new AdyenCheckoutError('ERROR', 'ClickToPay is not available')),
    finishIdentityValidation: () => Promise.reject(new AdyenCheckoutError('ERROR', 'ClickToPay is not available'))
});

export { ClickToPayContext };
