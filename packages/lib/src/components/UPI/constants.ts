import { UpiMode } from './types';

export const UPI_MODE = {
    QR_CODE: 'qrCode' as UpiMode,
    INTENT: 'intent' as UpiMode
} as const;

export const A11Y = {
    ButtonId: {
        QR: 'upi-button-qrCode',
        INTENT: 'upi-button-intent'
    },
    AreaId: {
        QR: 'upi-area-qrCode',
        INTENT: 'upi-area-intent'
    }
};
