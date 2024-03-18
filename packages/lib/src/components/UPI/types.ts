import { UIElementProps } from '../types';

export type UpiPaymentData = {
    paymentMethod: {
        type: 'upi_qr' | 'upi_collect' | 'upi_intent';
        virtualPaymentAddress?: string;
        appId?: string;
    };
};

export enum UpiMode {
    Vpa = 'vpa',
    QrCode = 'qrCode',
    Intent = 'upi_intent'
}

export type ApiId = { id: string; name: string };

export interface UPIElementProps extends UIElementProps {
    defaultMode: UpiMode;
    // upi_intent
    appIds?: Array<ApiId>;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
