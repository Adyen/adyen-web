import { UIElementProps } from '../types';

export type UpiPaymentData = {
    paymentMethod: {
        type: TX_VARIANT;
        virtualPaymentAddress?: string;
        appId?: string;
    };
};

export enum UpiMode {
    Collect = 'collect',
    QrCode = 'qr-code',
    Intent = 'intent'
}

export enum TX_VARIANT {
    UpiCollect = 'upi_collect',
    UpiQr = 'upi_qr',
    UpiIntent = 'upi_intent'
}

export type AppId = { id: string; name: string; type?: TX_VARIANT };

export interface UPIElementProps extends UIElementProps {
    defaultMode: UpiMode;
    // upi_intent
    appIds?: Array<AppId>;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
