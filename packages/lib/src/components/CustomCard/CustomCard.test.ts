import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ICore } from '../../types';
import CustomCard from './CustomCard';
import { CardBinLookupData } from '../internal/SecuredFields/lib/types';
import { BrandObject } from '../Card/types';
import { setupResourceMock } from '../../../config/testMocks/resourcesMock';

const SELECTABLE_DUAL_BRANDED_SCENARIO = 'Dual Branded (Selectable): Regulation mandates that you must provide a brand selection mechanism';
const DISPLAY_ONLY_DUAL_BRANDED_SCENARIO = 'Dual Branded (Display-only): No selection mechanism required';

const createBrandObject = (brand: string): BrandObject => ({
    brand,
    cvcPolicy: 'required',
    enableLuhnCheck: true,
    supported: true
});

describe('CustomCard', () => {
    let customCard: CustomCard;
    let core: ICore;

    beforeEach(() => {
        core = setupCoreMock();
        customCard = new CustomCard(core);
    });

    describe('get data', () => {
        test('always returns a type', () => {
            expect(customCard.data.paymentMethod.type).toBe('scheme');
        });

        test('always returns a state', () => {
            customCard.setState({ data: { test: '123' }, isValid: true });
            expect(customCard.data.paymentMethod.test).toBe('123');
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            expect(customCard.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            customCard.setState({ data: { test: '123' }, isValid: true });
            expect(customCard.isValid).toBe(true);
        });
    });

    describe('onBinLookup', () => {
        let onBinLookupMock: jest.Mock;

        beforeEach(() => {
            onBinLookupMock = jest.fn();
            customCard = new CustomCard(core, {
                onBinLookup: onBinLookupMock,
                brandsConfiguration: {},
                modules: { resources: setupResourceMock() }
            } as any);
        });

        test('should set dualBrandingType to null when only one brand is detected', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('visa')],
                detectedBrands: ['visa'],
                isReset: false
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dualBrandingType: null
                })
            );
        });

        test('should set dualBrandingType to selectable scenario when dual branded with cartebancaire', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('visa'), createBrandObject('cartebancaire')],
                detectedBrands: ['visa', 'cartebancaire'],
                isReset: false
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dualBrandingType: SELECTABLE_DUAL_BRANDED_SCENARIO
                })
            );
        });

        test('should set dualBrandingType to selectable scenario when dual branded with bcmc', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('maestro'), createBrandObject('bcmc')],
                detectedBrands: ['maestro', 'bcmc'],
                isReset: false
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dualBrandingType: SELECTABLE_DUAL_BRANDED_SCENARIO
                })
            );
        });

        test('should set dualBrandingType to selectable scenario when dual branded with dankort', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('visa'), createBrandObject('dankort')],
                detectedBrands: ['visa', 'dankort'],
                isReset: false
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dualBrandingType: SELECTABLE_DUAL_BRANDED_SCENARIO
                })
            );
        });

        test('should set dualBrandingType to display-only scenario when dual branded without regulated brands', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('mc'), createBrandObject('eftpos_australia')],
                detectedBrands: ['mc', 'eftpos_australia'],
                isReset: false
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dualBrandingType: DISPLAY_ONLY_DUAL_BRANDED_SCENARIO
                })
            );
        });

        test('should not set dualBrandingType when isReset is true', () => {
            const binLookupData: Partial<CardBinLookupData> = {
                supportedBrandsRaw: [createBrandObject('visa'), createBrandObject('cartebancaire')],
                detectedBrands: ['visa', 'cartebancaire'],
                isReset: true
            };

            customCard.onBinLookup(binLookupData as CardBinLookupData);

            expect(onBinLookupMock).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    dualBrandingType: expect.anything()
                })
            );
        });
    });
});
