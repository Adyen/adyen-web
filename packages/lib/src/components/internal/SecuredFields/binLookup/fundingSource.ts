import type { BrandObject, FundingSourceKeys } from '../../../Card/types';

const KNOWN_FUNDING_SOURCES = ['credit', 'debit', 'prepaid'] as const;

const isKnownFundingSource = (value: string): value is FundingSourceKeys => (KNOWN_FUNDING_SOURCES as readonly string[]).includes(value);

/**
 * Normalizes the comma-separated `allowedFundingSources` string sent in the scheme's configuration object
 * into a typed list.
 *
 * Unrecognized entries are dropped, and if nothing recognizable remains the rule is treated as absent, so a
 * misconfigured value fails open instead of silently rejecting every card in the component. This value is
 * populated by the backend rather than by the merchant, so a bad value is not reported to the console.
 */
export const parseAllowedFundingSources = (allowedFundingSources?: string): FundingSourceKeys[] | undefined => {
    if (!allowedFundingSources) return undefined;

    const knownValues = allowedFundingSources
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(isKnownFundingSource);

    return knownValues.length ? knownValues : undefined;
};

export const isFundingSourceAllowed = (brand: BrandObject, allowedFundingSources?: FundingSourceKeys[]): boolean => {
    // Brands that report no funding source cannot be evaluated, so they always count as allowed
    if (!allowedFundingSources?.length || !brand?.fundingSource?.length) return true;

    return brand.fundingSource.some(fundingSource => allowedFundingSources.includes(fundingSource.toLowerCase() as FundingSourceKeys));
};

export const sortBrandsByFundingSource = (brands: BrandObject[], allowedFundingSources?: FundingSourceKeys[]): BrandObject[] => {
    if (!allowedFundingSources?.length) return brands;

    const allowed = brands.filter(brand => isFundingSourceAllowed(brand, allowedFundingSources));
    if (allowed.length === brands.length) return brands;

    return [...allowed, ...brands.filter(brand => !isFundingSourceAllowed(brand, allowedFundingSources))];
};
