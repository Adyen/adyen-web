import { PaymentAmount } from '../../../types';
import Language from '../../../language/Language';

export interface QRLoaderProps {
    delay?: number;
    countdownTime?: number;
    onError?: (error) => void;
    onComplete?: (data) => void;
    throttleTime?: number;
    throttledInterval?: number;
    shouldRedirectOnMobile?: boolean;
    url?: string;
    type?: string;
    paymentData?: string;
    originKey?: string;
    clientKey?: string;
    loadingContext?: string;
    qrCodeData?: string;
    qrCodeImage?: string;
    amount?: PaymentAmount;
    i18n?: Language;
    classNameModifiers?: string[];
    brandLogo?: string;
    instructions?: string;
}

export interface QRLoaderState {
    buttonStatus: string;
    completed: boolean;
    delay: any;
    expired: boolean;
    loading: boolean;
    onError: (error) => void;
    percentage: number;
    timePassed: number;
}
