import { getIrisSegmentedControlOptions } from './utils';
import { IrisMode } from './types';
import { IRIS_ALLY_LABELS } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('getIrisSegmentedControlOptions', () => {
    const core = setupCoreMock();
    const { i18n } = core.modules;

    test('should return options with QR_CODE first', () => {
        const result = getIrisSegmentedControlOptions(i18n);

        expect(result).toHaveLength(2);
        expect(result[0].value).toBe(IrisMode.QR_CODE);
        expect(result[1].value).toBe(IrisMode.BANK_LIST);
    });

    test('should return options with correct accessibility IDs and controls', () => {
        const result = getIrisSegmentedControlOptions(i18n);

        const [qrCodeOption, bankListOption] = result;

        expect(qrCodeOption).toMatchObject({
            id: IRIS_ALLY_LABELS.ButtonId.QR_CODE,
            controls: IRIS_ALLY_LABELS.AreaId.QR_CODE
        });

        expect(bankListOption).toMatchObject({
            id: IRIS_ALLY_LABELS.ButtonId.BANK_LIST,
            controls: IRIS_ALLY_LABELS.AreaId.BANK_LIST
        });
    });

    test('should return all required properties for each option', () => {
        const result = getIrisSegmentedControlOptions(i18n);

        result.forEach(option => {
            expect(option).toHaveProperty('label');
            expect(option).toHaveProperty('value');
            expect(option).toHaveProperty('id');
            expect(option).toHaveProperty('controls');
        });
    });
});
