import { UpiMode } from '../../types';

export const A11Y = {
    ButtonId: {
        VPA: `upi-button-${UpiMode.Vpa}`,
        QR: `upi-button-${UpiMode.QrCode}`,
        INTENT: `upi-button-${UpiMode.Intent}`
    },
    AreaId: {
        VPA: `upi-area-${UpiMode.Vpa}`,
        QR: `upi-area-${UpiMode.QrCode}`,
        INTENT: `upi-area-${UpiMode.Intent}`
    }
};
