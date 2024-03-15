import { UIElementProps } from '../types';

export type UpiPaymentData = {
    paymentMethod: {
        type: 'upi_qr' | 'upi_collect';
        virtualPaymentAddress?: string;
    };
};

export enum UpiMode {
    Vpa = 'vpa',
    QrCode = 'qrCode'
}

export type apiId = { id: string; name: string };

export interface UPIElementProps extends UIElementProps {
    defaultMode: UpiMode;
    // upi_intent
    appIds?: Array<apiId>;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
