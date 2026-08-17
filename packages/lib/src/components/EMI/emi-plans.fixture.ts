import type { EmiIssuerOption } from './types';

/**
 * Shared view-model fixture for the unit tests. Never imported by runtime code.
 * Amounts are in minor units and mirror the design screenshots (₹1,54,999.00 checkout amount).
 */
export const EMI_FIXTURE_CHECKOUT_AMOUNT = { value: 15499900, currency: 'INR' };

export const emiIssuersFixture: EmiIssuerOption[] = [
    {
        id: 'hdfc',
        name: 'HDFC Bank',
        fundingSource: 'credit',
        plans: [
            {
                id: 'hdfc:3:noCost',
                tenureMonths: 3,
                type: 'noCost',
                interestRateBps: 1550,
                monthlyPayableAmount: { value: 5880000, currency: 'INR' },
                totalPayableAmount: { value: 16399900, currency: 'INR' },
                totalInterestAmount: { value: 0, currency: 'INR' },
                selectedOffer: { id: 'offer-hdfc-nocost', amount: { value: 400000, currency: 'INR' } }
            },
            {
                id: 'hdfc:6:standard',
                tenureMonths: 6,
                type: 'standard',
                interestRateBps: 1550,
                monthlyPayableAmount: { value: 2940000, currency: 'INR' },
                totalPayableAmount: { value: 16899900, currency: 'INR' },
                totalInterestAmount: { value: 1400000, currency: 'INR' }
            }
        ]
    },
    {
        id: 'icici',
        name: 'ICICI Bank',
        fundingSource: 'credit',
        plans: [
            {
                id: 'icici:3:lowCost',
                tenureMonths: 3,
                type: 'lowCost',
                interestRateBps: 750,
                monthlyPayableAmount: { value: 5880000, currency: 'INR' },
                totalPayableAmount: { value: 16399900, currency: 'INR' },
                totalInterestAmount: { value: 420100, currency: 'INR' },
                selectedOffer: { id: 'offer-icici-lowcost', amount: { value: 600000, currency: 'INR' } }
            },
            {
                id: 'icici:9:standard',
                tenureMonths: 9,
                type: 'standard',
                interestRateBps: 1599,
                monthlyPayableAmount: { value: 1960000, currency: 'INR' },
                totalPayableAmount: { value: 17399900, currency: 'INR' },
                totalInterestAmount: { value: 1900000, currency: 'INR' }
            }
        ]
    },
    {
        id: 'axis',
        name: 'Axis Bank',
        fundingSource: 'debit',
        plans: [
            {
                id: 'axis:3:standard',
                tenureMonths: 3,
                type: 'standard',
                interestRateBps: 1550,
                monthlyPayableAmount: { value: 5880000, currency: 'INR' },
                totalPayableAmount: { value: 16399900, currency: 'INR' },
                totalInterestAmount: { value: 730800, currency: 'INR' }
            }
        ]
    },
    {
        id: 'kotak',
        name: 'Kotak Mahindra Bank',
        fundingSource: 'credit',
        plans: [
            {
                id: 'kotak:12:standard',
                tenureMonths: 12,
                type: 'standard',
                interestRateBps: 1200
            }
        ]
    }
];
