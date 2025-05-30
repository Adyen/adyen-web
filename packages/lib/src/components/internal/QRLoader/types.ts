import { ActionHandledReturnObject, PaymentAmount } from '../../../types/global-types';
import Language from '../../../language/Language';
import { h } from 'preact';
import { AnalyticsEvent } from '../../../core/Analytics/AnalyticsEvent';

export interface QRLoaderProps {
    delay?: number;
    countdownTime?: number;
    onError?: (error) => void;
    onComplete?: (data, component) => void;
    throttleTime?: number;
    throttledInterval?: number;
    url?: string;
    type?: string;
    paymentData?: string;
    clientKey?: string;
    loadingContext?: string;
    qrCodeData?: string;
    qrCodeImage?: string;
    amount?: PaymentAmount;
    i18n?: Language;
    classNameModifiers?: string[];
    brandLogo?: string;
    brandName?: string;
    buttonLabel?: string;
    redirectIntroduction?: string;
    timeToPay?: string;
    introduction?: string | (() => h.JSX.Element);
    instructions?: string | (() => h.JSX.Element);
    copyBtn?: boolean;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    onSubmitAnalytics?: (aObj: AnalyticsEvent) => void;
}

export interface QRLoaderState {
    buttonStatus: string;
    completed: boolean;
    delay: any;
    expired: boolean;
    loading: boolean;
    percentage: number;
    timePassed: number;
}
