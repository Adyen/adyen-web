import { CountdownTime } from '../../components/internal/Countdown/types';
import { AdyenCheckoutError, RawPaymentResponse } from '../../types';

export interface PaymentCompeteStatus {
    data: {
        details: { payload: string };
        paymentData?: string;
    };
}

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
    onComplete: (status: PaymentCompeteStatus) => void;
    pollStatus?: () => Promise<RawPaymentResponse>;
    onActionHandled?: (payload: { componentType: string; actionDescription: string }) => void;
    type: string;
}
