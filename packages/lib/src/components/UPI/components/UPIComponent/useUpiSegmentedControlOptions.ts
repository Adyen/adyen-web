import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { App, UpiMode } from '../../types';
import { A11Y } from './constants';
import isMobile from '../../../../utils/isMobile';

function useUpiSegmentedControlOptions(apps: Array<App>, mode: UpiMode) {
    const { i18n } = useCoreContext();

    return useMemo(() => {
        const intentOption = {
            label: i18n.get('upi.mode.payByAnyUpi'),
            value: UpiMode.Intent,
            htmlProps: {
                id: A11Y.ButtonId.INTENT,
                'aria-expanded': mode === UpiMode.Intent,
                'aria-controls': A11Y.AreaId.INTENT
            }
        };
        const vpaOption = {
            label: i18n.get('upi.mode.enterUpiId'),
            value: UpiMode.Vpa,
            htmlProps: {
                id: A11Y.ButtonId.VPA,
                'aria-expanded': mode === UpiMode.Vpa,
                'aria-controls': A11Y.AreaId.VPA
            }
        };
        const qrOption = {
            label: i18n.get('upi.mode.qrCode'),
            value: UpiMode.QrCode,
            htmlProps: {
                id: A11Y.ButtonId.QR,
                'aria-expanded': mode === UpiMode.QrCode,
                'aria-controls': A11Y.AreaId.QR
            }
        };

        const shouldShowUpiIntent = apps.length > 0;
        const positionOfQrOption = isMobile() ? 1 : 0;
        const segmentedControlOptions = new Array(2).fill(shouldShowUpiIntent ? intentOption : vpaOption);
        segmentedControlOptions[positionOfQrOption] = qrOption;
        return segmentedControlOptions;
    }, [apps]);
}

export default useUpiSegmentedControlOptions;
