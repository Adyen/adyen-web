import { UIElementProps } from '../../internal/UIElement/types';

export interface QRLoaderConfiguration extends UIElementProps {
    /**
     * Number of miliseconds that the component will wait in between status calls
     */
    delay?: number;

    /**
     * Number of minutes that the component should keep on loading
     */
    countdownTime?: number;

    type?: string;
    brandLogo?: string;
    buttonLabel?: string;
    qrCodeImage?: string;
    paymentData?: string;
    introduction?: string;
    instructions?: string;
    copyBtn?: boolean;
}
