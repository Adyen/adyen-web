import { filterBrandsByFundingSource, parseAllowedFundingSources } from './fundingSource';
import type { BrandObject, FundingSourceKeys } from '../../../Card/types';

const brandObject = (brand: string, fundingSource?: string): BrandObject =>
    ({ brand, cvcPolicy: 'required', enableLuhnCheck: true, showExpiryDate: true, supported: true, fundingSource }) as BrandObject;

describe('parseAllowedFundingSources', () => {
    test('returns undefined when no value is configured', () => {
        expect(parseAllowedFundingSources(undefined)).toBe(undefined);
        expect(parseAllowedFundingSources('')).toBe(undefined);
    });

    test('parses a single value', () => {
        expect(parseAllowedFundingSources('debit')).toEqual(['debit']);
    });

    test('parses a comma-separated list, trimming whitespace', () => {
        expect(parseAllowedFundingSources('debit, prepaid')).toEqual(['debit', 'prepaid']);
        expect(parseAllowedFundingSources('  credit ,debit  ')).toEqual(['credit', 'debit']);
    });

    test('lowercases the configured values', () => {
        expect(parseAllowedFundingSources('DEBIT, Prepaid')).toEqual(['debit', 'prepaid']);
    });

    test('ignores empty entries', () => {
        expect(parseAllowedFundingSources(' , , ')).toBe(undefined);
        expect(parseAllowedFundingSources('debit,,prepaid')).toEqual(['debit', 'prepaid']);
    });

    test('drops unrecognized values but keeps the valid ones', () => {
        expect(parseAllowedFundingSources('debit,foo')).toEqual(['debit']);
    });

    test('returns undefined when no value is recognized, so that validation fails open', () => {
        expect(parseAllowedFundingSources('foo, bar')).toBe(undefined);
    });
});

describe('filterBrandsByFundingSource', () => {
    const visaCredit = brandObject('visa', 'credit');
    const visaDebit = brandObject('visa', 'debit');
    const mcNoFundingSource = brandObject('mc');

    test('returns the brands untouched when no funding sources are allowed', () => {
        const brands = [visaCredit, visaDebit];
        expect(filterBrandsByFundingSource(brands, undefined)).toBe(brands);
        expect(filterBrandsByFundingSource(brands, [])).toBe(brands);
    });

    test('retains only the brands with an allowed funding source', () => {
        expect(filterBrandsByFundingSource([visaCredit, visaDebit], ['debit'])).toEqual([visaDebit]);
    });

    test('retains brands that report no funding source', () => {
        expect(filterBrandsByFundingSource([visaCredit, mcNoFundingSource], ['debit'])).toEqual([mcNoFundingSource]);
    });

    test('matches the funding source case-insensitively', () => {
        expect(filterBrandsByFundingSource([brandObject('visa', 'DEBIT')], ['debit'])).toHaveLength(1);
    });

    test('returns an empty array when every brand reports a disallowed funding source', () => {
        expect(filterBrandsByFundingSource([visaCredit, brandObject('mc', 'credit')], ['debit', 'prepaid'] as FundingSourceKeys[])).toEqual([]);
    });
});
