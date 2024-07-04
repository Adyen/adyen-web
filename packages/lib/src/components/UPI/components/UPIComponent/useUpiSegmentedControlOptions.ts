import { useMemo } from 'preact/hooks';
import { App, UpiMode } from '../../types';
import { A11Y } from './constants';
import isMobile from '../../../../utils/isMobile';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

interface SegmentedControlOption {
    label: string;
    value: UpiMode;
    htmlProps: {
        id: string;
        'aria-expanded': boolean;
        'aria-controls': string;
    };
}

function useUpiSegmentedControlOptions(apps: Array<App>, mode: UpiMode): Array<SegmentedControlOption> {
    const { i18n } = useCoreContext();

    return useMemo(() => {
        const intentOption: SegmentedControlOption = {
            label: i18n.get('upi.mode.payByAnyUpi'),
            value: 'intent',
            htmlProps: {
                id: A11Y.ButtonId.INTENT,
                'aria-expanded': mode === 'intent',
                'aria-controls': A11Y.AreaId.INTENT
            }
        };
        const vpaOption: SegmentedControlOption = {
            label: i18n.get('upi.mode.enterUpiId'),
            value: 'vpa',
            htmlProps: {
                id: A11Y.ButtonId.VPA,
                'aria-expanded': mode === 'vpa',
                'aria-controls': A11Y.AreaId.VPA
            }
        };
        const qrOption: SegmentedControlOption = {
            label: i18n.get('upi.mode.qrCode'),
            value: 'qrCode',
            htmlProps: {
                id: A11Y.ButtonId.QR,
                'aria-expanded': mode === 'qrCode',
                'aria-controls': A11Y.AreaId.QR
            }
        };

        const shouldShowUpiIntent = apps.length > 0;
        const positionOfQrOption = isMobile() ? 1 : 0;
        const segmentedControlOptions = new Array(2).fill(shouldShowUpiIntent ? intentOption : vpaOption);
        segmentedControlOptions[positionOfQrOption] = qrOption;
        return segmentedControlOptions;
    }, [apps, mode]);
}

export default useUpiSegmentedControlOptions;
