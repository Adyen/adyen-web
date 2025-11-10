import { CountdownTime } from '../../components/internal/Countdown/types';
import { AdyenCheckoutError, RawPaymentResponse } from '../../types';

export interface UsePaymentStatusTimerProps {
    paymentData?: string;
    clientKey: string;
    delay?: number;
    throttleTime?: number;
    throttleInterval?: number;
    onError: (error: AdyenCheckoutError) => void;
    onComplete: (status: any) => void;
    pollStatus?: () => Promise<RawPaymentResponse>;
    onActionHandled?: (payload: { componentType: string; actionDescription: string }) => void;
    type: string;
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
