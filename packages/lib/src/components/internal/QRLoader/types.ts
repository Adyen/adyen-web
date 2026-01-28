import { ComponentChildren, h } from 'preact';
import Language from '../../../language/Language';
import { AbstractAnalyticsEvent } from '../../../core/Analytics/events/AbstractAnalyticsEvent';
import { CountdownTime } from '../Countdown/types';
import { UsePaymentStatusTimerProps } from '../../../hooks/usePaymentStatusTimer/types';

export type QRLoaderProps = Pick<
    UsePaymentStatusTimerProps,
    'loadingContext' | 'paymentData' | 'clientKey' | 'delay' | 'throttleTime' | 'type' | 'onError' | 'onComplete' | 'onActionHandled'
> & {
    countdownTime?: number;
    throttledInterval?: number;
    url?: string;
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
    onSubmitAnalytics?: (aObj: AbstractAnalyticsEvent) => void;
    children?: ComponentChildren;
};

export interface QRCountdownProps {
    countdownTime: number;
    timeToPay: string;
    onTick: (time: CountdownTime) => void;
    onCompleted: () => void;
}

export interface QRImageProps {
    type: string;
    src: string;
    onLoad: () => void;
}
