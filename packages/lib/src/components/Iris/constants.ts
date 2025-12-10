import Language from '../../language';
import { SegmentedControlOption } from '../internal/SegmentedControl/SegmentedControl';
import { IrisMode } from './types';

export const IRIS_ALLY_LABELS = {
    ButtonId: {
        BANK_LIST: 'iris-button-bank-list',
        QR_CODE: 'iris-button-qrCode'
    },
    AreaId: {
        BANK_LIST: 'iris-area-bank-list',
        QR_CODE: 'iris-area-qrCode'
    }
};

export const getIrisSegmentedControlOptions = (i18n: Language): SegmentedControlOption<IrisMode>[] => [
    {
        label: i18n.get('QR Code'),
        value: IrisMode.QR_CODE,
        id: IRIS_ALLY_LABELS.ButtonId.QR_CODE,
        controls: IRIS_ALLY_LABELS.AreaId.QR_CODE
    },
    {
        label: i18n.get('Bank List'),
        value: IrisMode.BANK_LIST,
        id: IRIS_ALLY_LABELS.ButtonId.BANK_LIST,
        controls: IRIS_ALLY_LABELS.AreaId.BANK_LIST
    }
];

export const DEFAULT_IRIS_COUNTDOWN_TIME = 10;
