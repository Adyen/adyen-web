import { UIElementProps } from '../../internal/UIElement/types';
import { h } from 'preact';

export interface QRLoaderConfiguration extends UIElementProps {
    /**
     * Number of milliseconds that the component will wait in between status calls
     * @default 2_000
     */
    delay?: number;

    /**
     * Number of minutes that the component should keep on loading
     * @default 15
     */
    countdownTime?: number;

    /**
     * Number of milliseconds that the component will switch to throttled mode
     * @default 60_000
     */
    throttleTime?: number;

    /**
     * Number of milliseconds that the component will wait in between status calls when in throttled mode
     * @default 10_000
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
