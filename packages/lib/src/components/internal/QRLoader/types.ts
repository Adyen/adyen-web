import { ComponentChildren, h } from 'preact';
import { ActionHandledReturnObject, PaymentAmount } from '../../../types/global-types';
import Language from '../../../language/Language';
import { AbstractAnalyticsEvent } from '../../../core/Analytics/events/AbstractAnalyticsEvent';
import { CountdownTime } from '../Countdown/types';
import { AdditionalDetailsData, AdyenCheckoutError } from '../../../types';

export interface QRLoaderProps {
    // Component type that is creating the action (e.g. wechatpayQR)
    type: string;
    delay?: number;
    countdownTime?: number;
    onError?: (error: AdyenCheckoutError) => void;
    onComplete?: (status: AdditionalDetailsData) => void;
    throttleTime?: number;
    throttledInterval?: number;
    url?: string;
    paymentData?: string;
    clientKey?: string;
    loadingContext?: string;
    qrCodeData?: string;
    qrCodeImage?: string;
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
    onSubmitAnalytics?: (aObj: AbstractAnalyticsEvent) => void;
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
