import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';
import { Mandate } from './components/UPIMandate/UPIMandate';

export type UpiType = TxVariants.upi_qr | TxVariants.upi_intent;

export type UpiMode = 'qrCode' | 'intent';

export type App = { id: string; name: string };

export type UpiPaymentData = {
    paymentMethod: {
        type: UpiType;
        appId?: string;
    };
    mandate?: Mandate;
};

export interface UPIConfiguration extends UIElementProps {
    /**
     * @deprecated
     * UPI configuration property "defaultMode" is deprecated and will be removed in a future version.
     */
    defaultMode?: UpiMode;
    // upi autopay
    mandate?: Mandate;
    // upi_intent
    apps?: Array<App>;
    /**
     * Redirect url for upi intent apps
     * @internal
     */
    url?: string;
    /**
     * @internal
     */
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
    /**
     * The duration in minutes before the await/QR code expires.
     */
    countdownTime?: number;
    /**
     * Show the available UPI apps images on the Drop-in payment method item
     */
    showPaymentMethodItemImages?: boolean;
    /**
     * Show `+ other` after the UPI apps images on the Drop-in payment method item
     */
    showOtherInsteadOfNumber?: boolean;
}

/**
 * @internal
 */
export type UPIAppList = Array<{ id: string; name: string; icon: string }>;
