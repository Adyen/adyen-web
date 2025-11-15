import { CountdownTime } from '../../components/internal/Countdown/types';
import { AdditionalDetailsData, AdyenCheckoutError, RawPaymentResponse, RawPaymentStatusResponse } from '../../types';
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
    loadingContext: string;
    paymentData?: string;
    clientKey: string;
    delay?: number;
    throttleTime?: number;
    throttleInterval?: number;
    onError: (error: AdyenCheckoutError) => void;
    onComplete: (status: AdditionalDetailsData) => void;
    pollStatus?: () => Promise<RawPaymentResponse | RawPaymentStatusResponse>;
    onActionHandled?: (payload: { componentType: string; actionDescription: string }) => void;
    type: string;
}
