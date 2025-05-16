import { UIElementProps } from '../UIElement/types';
import { ActionHandledReturnObject, PaymentAmount, RawPaymentResponse } from '../../../types/global-types';
import { h } from 'preact';

interface StatusObjectProps {
    payload: string;
    resultCode: string;
    type: string;
}

export interface StatusObject {
    type: string;
    props: StatusObjectProps;
}

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
    onError: (error) => void;
    onComplete: (status, component) => void;
    brandLogo?: string;
    messageText?: string;
    awaitText: string;
    ref?: any;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    pollStatus?: () => Promise<RawPaymentResponse>;
    instructions?: string | (() => h.JSX.Element);
    endSlot?: () => h.JSX.Element;
    amount?: PaymentAmount;
    showAmount?: boolean;
}

export interface AwaitConfiguration extends UIElementProps {
    paymentData?: string;
    paymentMethoType?: string;
    type?: string;
    url?: string;
}
