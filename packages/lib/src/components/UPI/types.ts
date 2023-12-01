import { UIElementProps } from '../internal/UIElement/types';

export type UpiPaymentData = {
    paymentMethod: {
        type: 'upi_qr' | 'upi_collect';
        virtualPaymentAddress?: string;
    };
};

export type UpiMode = 'vpa' | 'qrCode';

export interface UPIConfiguration extends UIElementProps {
    /**
     * Define which view is displayed initially when the Component renders
     * @defaultValue vpa
     */
    defaultMode?: UpiMode;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
