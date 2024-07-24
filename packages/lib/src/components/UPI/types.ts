import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';

export type UpiType = TxVariants.upi_qr | TxVariants.upi_intent | TxVariants.upi_collect;

export type UpiMode = 'vpa' | 'qrCode' | 'intent';

export type App = { id: string; name: string; type?: UpiType };

export type UpiPaymentData = {
    paymentMethod: {
        type: UpiType;
        virtualPaymentAddress?: string;
        appId?: string;
    };
};

export interface UPIConfiguration extends UIElementProps {
    defaultMode?: UpiMode;
    // upi_intent
    apps?: Array<App>;
    /**
     * Redirect url for upi intent apps
     * @internal
     */
    url?: string;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
