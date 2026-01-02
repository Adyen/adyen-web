import Language from '../../language';
import { SegmentedControlOption } from '../internal/SegmentedControl/SegmentedControl';
import { IRIS_ALLY_LABELS } from './constants';
import { IrisMode } from './types';

export const getIrisSegmentedControlOptions = (i18n: Language, defaultMode: IrisMode): SegmentedControlOption<IrisMode>[] => {
    const options = [
        {
            label: i18n.get('qrCode'),
            value: IrisMode.QR_CODE,
            id: IRIS_ALLY_LABELS.ButtonId.QR_CODE,
            controls: IRIS_ALLY_LABELS.AreaId.QR_CODE
        },
        {
            label: i18n.get('bankList'),
            value: IrisMode.BANK_LIST,
            id: IRIS_ALLY_LABELS.ButtonId.BANK_LIST,
            controls: IRIS_ALLY_LABELS.AreaId.BANK_LIST
        }
    ];

    return options.sort((a, b) => {
        if (a.value === defaultMode) return -1;
        if (b.value === defaultMode) return 1;
        return 0;
    });
};
