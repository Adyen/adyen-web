import { SegmentedControlOption } from '../internal/SegmentedControl/SegmentedControl';
import { UpiMode } from './types';
import Language from '../../language';

export const A11Y = {
    ButtonId: {
        VPA: 'upi-button-vpa',
        QR: 'upi-button-qrCode',
        INTENT: 'upi-button-intent'
    },
    AreaId: {
        VPA: 'upi-area-vpa',
        QR: 'upi-area-qrCode',
        INTENT: 'upi-area-intent'
    }
};

export const getIntentOption = (i18n: Language): SegmentedControlOption<UpiMode> => ({
    label: i18n.get('upi.mode.payByAnyUpi'),
    value: 'intent',
    id: A11Y.ButtonId.INTENT,
    controls: A11Y.AreaId.INTENT
});

export const getVpaOption = (i18n: Language): SegmentedControlOption<UpiMode> => ({
    label: i18n.get('upi.mode.enterUpiId'),
    value: 'vpa',
    id: A11Y.ButtonId.VPA,
    controls: A11Y.AreaId.VPA
});

export const getQrOption = (i18n: Language): SegmentedControlOption<UpiMode> => ({
    label: i18n.get('upi.mode.qrCode'),
    value: 'qrCode',
    id: A11Y.ButtonId.QR,
    controls: A11Y.AreaId.QR
});
