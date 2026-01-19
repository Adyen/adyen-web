import { CountdownTime } from '../../components/internal/Countdown/types';
import { ActionHandledReturnObject, AdditionalDetailsData, AdyenCheckoutError, RawPaymentResponse, RawPaymentStatusResponse } from '../../types';
export interface PaymentStatusTimerState {
    completed: boolean;
    expired: boolean;
    loading: boolean;
    percentage: number;
    timePassed: number;
}

export interface PaymentStatusTimerActions {
    onTick: (time: CountdownTime) => void;
    onTimeUp: () => void;
}

export interface UsePaymentStatusTimerProps {
    /**
     * Component type that is creating the action
     * @example 'iris'
     */
    type: string;
    loadingContext?: string;
    paymentData?: string;
    clientKey?: string;
    /**
     * Number of milliseconds between status calls
     * @default 2_000
     */
    delay?: number;
    /**
     * Number of milliseconds after which the timer will switch to throttled mode
     * @default 60_000
     */
    throttleTime?: number;
    /**
     * Number of milliseconds that the timer will wait in between status calls when in throttled mode
     * @default 10_000
     */
    throttleInterval?: number;
    onError: (error: AdyenCheckoutError) => void;
    onComplete: (status: AdditionalDetailsData) => void;
    pollStatus?: () => Promise<RawPaymentResponse | RawPaymentStatusResponse>;
    onActionHandled?: (payload: ActionHandledReturnObject) => void;
}
