import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { AppId, UpiMode } from '../../types';
import { A11Y } from './constants';

function useUpiSegmentedControlOptions(appIds: Array<AppId>, mode: UpiMode) {
    const { i18n } = useCoreContext();

    return useMemo(() => {
        const shouldShowUpiIntent = appIds.length > 0;

        const intentOption = {
            label: i18n.get('upi.intent.payByAnyUpi'),
            value: UpiMode.Intent,
            htmlProps: {
                id: A11Y.ButtonId.INTENT,
                'aria-expanded': mode === UpiMode.Intent,
                'aria-controls': A11Y.AreaId.INTENT
            }
        };

        const vpaOption = {
            label: i18n.get('upi.collect.enterUpiId'),
            value: UpiMode.Collect,
            htmlProps: {
                id: A11Y.ButtonId.VPA,
                'aria-expanded': mode === UpiMode.Collect,
                'aria-controls': A11Y.AreaId.VPA
            }
        };

        const qrOption = {
            label: 'QR Code',
            value: UpiMode.QrCode,
            htmlProps: {
                id: A11Y.ButtonId.QR,
                'aria-expanded': mode === UpiMode.QrCode,
                'aria-controls': A11Y.AreaId.QR
            }
        };

        return shouldShowUpiIntent ? [intentOption, qrOption] : [vpaOption, qrOption];
    }, [appIds]);
}

export default useUpiSegmentedControlOptions;
