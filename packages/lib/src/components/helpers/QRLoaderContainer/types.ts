import { UIElementProps } from '../../internal/UIElement/types';
import { h } from 'preact';

export interface QRLoaderConfiguration extends UIElementProps {
    /**
     * Number of milliseconds that the component will wait in between status calls
     */
    delay?: number;

    /**
     * Number of minutes that the component should keep on loading
     */
    countdownTime?: number;

    /**
     * Number of milliseconds that the component will switch to throttled mode
     */
    throttleTime?: number;

    /**
     * Number of milliseconds that the component will wait in between status calls when in throttled mode
     */
    throttleInterval?: number;

    type?: string;
    brandLogo?: string;
    buttonLabel?: string;
    qrCodeImage?: string;
    qrCodeData?: string;
    paymentData?: string;
    redirectIntroduction?: string;
    timeToPay?: string;
    copyBtn?: boolean;
    introduction?: string | (() => h.JSX.Element);
    instructions?: string | (() => h.JSX.Element);
}
