import { getMaxBrandsToShow } from './utils';
import { BrandIcon } from '../../../../internal/BrandIcons/types';

const makeBrands = (count: number): BrandIcon[] => Array.from({ length: count }, (_, i) => ({ src: `brand${i}.png`, alt: `brand${i}` }));

describe('getMaxBrandsToShow', () => {
    test('should return undefined when brands count is less than 4', () => {
        expect(getMaxBrandsToShow(makeBrands(2))).toBeUndefined();
    });

    test('should return undefined when brands count is exactly 4', () => {
        expect(getMaxBrandsToShow(makeBrands(4))).toBeUndefined();
    });

    test('should return 3 when brands count is 5', () => {
        expect(getMaxBrandsToShow(makeBrands(5))).toBe(3);
    });

    test('should return 3 when brands count is greater than 5', () => {
        expect(getMaxBrandsToShow(makeBrands(10))).toBe(3);
    });

    test('should return undefined for a single brand', () => {
        expect(getMaxBrandsToShow(makeBrands(1))).toBeUndefined();
    });

    test('should return undefined for an empty array', () => {
        expect(getMaxBrandsToShow([])).toBeUndefined();
    });
});
