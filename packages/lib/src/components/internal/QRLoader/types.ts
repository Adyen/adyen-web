import { ComponentChildren, h } from 'preact';
import { ActionHandledReturnObject, PaymentAmount } from '../../../types/global-types';
import Language from '../../../language/Language';
import { AnalyticsEvent } from '../../../core/Analytics/AnalyticsEvent';
import { CountdownTime } from '../Countdown/types';

export interface QRLoaderProps {
    delay?: number;
    countdownTime?: number;
    onError?: (error) => void;
    onComplete?: (data) => void;
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
    showAmount?: boolean;
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
    children?: ComponentChildren;
}

export interface QRCountdownProps {
    countdownTime: number;
    timeToPay: string;
    onTick: (time: CountdownTime) => void;
    onCompleted: () => void;
}

export interface QRImageProps {
    src: string;
    onLoad: () => void;
}
