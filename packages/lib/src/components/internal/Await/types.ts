import { UIElementProps } from '../UIElement/types';
import { ActionHandledReturnObject, PaymentAmount, RawPaymentResponse } from '../../../types/global-types';
import { h } from 'preact';
import { AdditionalDetailsData, AdyenCheckoutError, RawPaymentStatusResponse } from '../../../types';

export interface AwaitComponentProps {
    type: string;
    delay?: number;
    countdownTime: number;
    throttleTime: number;
    showCountdownTimer: boolean;
    shouldRedirectAutomatically?: boolean;
    throttleInterval: number;
    paymentData?: string;
    url?: string;
    classNameModifiers?: string[];
    clientKey: string;
    onError: (error: AdyenCheckoutError) => void;
    onComplete: (status: AdditionalDetailsData) => void;
    brandLogo?: string;
    messageText?: string;
    awaitText: string;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    pollStatus?: () => Promise<RawPaymentResponse | RawPaymentStatusResponse>;
    instructions?: string | (() => h.JSX.Element);
    endSlot?: () => h.JSX.Element;
    showAmount?: boolean;
}

export interface AwaitConfiguration extends UIElementProps {
    paymentData?: string;
    paymentMethoType?: string;
    type?: string;
    url?: string;
}
