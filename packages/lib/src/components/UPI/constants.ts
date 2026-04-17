import { UpiMode } from './types';

export const UPI_MODE = {
    QR_CODE: 'qrCode' as UpiMode,
    INTENT: 'intent' as UpiMode
} as const;
// temporary limit of primary apps to show, rollback to 4 when ready
export const MAX_PRIMARY_APPS = 4;

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

export const UPI_COUNTDOWN_TIME = 5;
