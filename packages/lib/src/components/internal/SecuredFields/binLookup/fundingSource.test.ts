import { isFundingSourceAllowed, parseAllowedFundingSources, sortBrandsByFundingSource } from './fundingSource';
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

const visaCredit = brandObject('visa', 'credit');
const visaDebit = brandObject('visa', 'debit');
const cbDebit = brandObject('cartebancaire', 'debit');
const mcNoFundingSource = brandObject('mc');

describe('isFundingSourceAllowed', () => {
    test('allows any brand when no funding sources are configured', () => {
        expect(isFundingSourceAllowed(visaCredit, undefined)).toBe(true);
        expect(isFundingSourceAllowed(visaCredit, [])).toBe(true);
    });

    test('allows a brand whose funding source is in the list', () => {
        expect(isFundingSourceAllowed(visaDebit, ['debit', 'prepaid'] as FundingSourceKeys[])).toBe(true);
    });

    test('rejects a brand whose funding source is not in the list', () => {
        expect(isFundingSourceAllowed(visaCredit, ['debit'])).toBe(false);
    });

    test('allows a brand that reports no funding source, since it cannot be evaluated', () => {
        expect(isFundingSourceAllowed(mcNoFundingSource, ['debit'])).toBe(true);
    });

    test('matches the funding source case-insensitively', () => {
        expect(isFundingSourceAllowed(brandObject('visa', 'DEBIT'), ['debit'])).toBe(true);
    });
});

describe('sortBrandsByFundingSource', () => {
    test('returns the brands untouched when no funding sources are allowed', () => {
        const brands = [visaCredit, visaDebit];
        expect(sortBrandsByFundingSource(brands, undefined)).toBe(brands);
        expect(sortBrandsByFundingSource(brands, [])).toBe(brands);
    });

    test('returns the brands untouched when they are all allowed', () => {
        const brands = [cbDebit, visaDebit];
        expect(sortBrandsByFundingSource(brands, ['debit'])).toBe(brands);
    });

    test('keeps the disallowed brands, moving them behind the allowed ones', () => {
        expect(sortBrandsByFundingSource([visaCredit, cbDebit], ['debit'])).toEqual([cbDebit, visaCredit]);
    });

    test('preserves the relative order within the allowed and the disallowed group', () => {
        const brands = [visaCredit, cbDebit, brandObject('mc', 'credit'), visaDebit];
        expect(sortBrandsByFundingSource(brands, ['debit'])).toEqual([cbDebit, visaDebit, visaCredit, brandObject('mc', 'credit')]);
    });

    test('treats a brand without a funding source as allowed', () => {
        expect(sortBrandsByFundingSource([visaCredit, mcNoFundingSource], ['debit'])).toEqual([mcNoFundingSource, visaCredit]);
    });

    test('returns every brand, in order, when none of them is allowed', () => {
        const brands = [visaCredit, brandObject('mc', 'credit')];
        expect(sortBrandsByFundingSource(brands, ['debit', 'prepaid'] as FundingSourceKeys[])).toEqual(brands);
    });
});
