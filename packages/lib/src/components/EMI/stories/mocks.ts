import type { EmiPlansResponse } from '../types';

/**
 * Amounts are in minor units and mirror the design screenshots (₹1,54,999.00 checkout amount).
 */
export const EMI_FIXTURE_CHECKOUT_AMOUNT = { value: 15499900, currency: 'INR' };

/**
 * Raw `POST /paymentMethods/emi/plans` response, as a merchant would hand it over, and the single
 * fixture behind the Storybook handler, the Playwright route mock and the unit tests. Everything in it
 * is selectable and payable, exactly as the contract promises.
 */
export const emiPlansResponseMock: EmiPlansResponse = {
    issuers: [
        {
            issuerName: 'HDFC Bank',
            issuerCode: 'HDFC',
            fundingSource: 'credit',
            plans: [
                {
                    type: 'noCost',
                    tenureMonths: 3,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 5033300, currency: 'INR' },
                        totalPayableAmount: { value: 15099900, currency: 'INR' },
                        totalInterestAmount: { value: 0, currency: 'INR' }
                    },
                    // Both offers ride on the payload; only the larger one is shown
                    offers: [
                        { offerId: 'offer-hdfc-cashback', type: 'CASHBACK', amount: { value: 250000, currency: 'INR' }, description: 'Cashback' },
                        { offerId: 'offer-hdfc-nocost', type: 'DISCOUNT', amount: { value: 400000, currency: 'INR' }, description: 'No cost EMI' }
                    ]
                },
                {
                    type: 'standard',
                    tenureMonths: 6,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 2816650, currency: 'INR' },
                        totalPayableAmount: { value: 16899900, currency: 'INR' },
                        totalInterestAmount: { value: 1400000, currency: 'INR' }
                    }
                }
            ]
        },
        {
            issuerName: 'ICICI Bank',
            issuerCode: 'ICICI',
            fundingSource: 'credit',
            plans: [
                {
                    type: 'lowCost',
                    tenureMonths: 3,
                    interestRateBps: 750,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 5106667, currency: 'INR' },
                        totalPayableAmount: { value: 15320000, currency: 'INR' },
                        totalInterestAmount: { value: 420100, currency: 'INR' }
                    },
                    offers: [{ offerId: 'offer-icici-lowcost', type: 'DISCOUNT', amount: { value: 600000, currency: 'INR' } }]
                },
                {
                    type: 'standard',
                    tenureMonths: 9,
                    interestRateBps: 1599,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 1933322, currency: 'INR' },
                        totalPayableAmount: { value: 17399900, currency: 'INR' },
                        totalInterestAmount: { value: 1900000, currency: 'INR' }
                    }
                }
            ]
        },
        {
            issuerName: 'Axis Bank',
            issuerCode: 'AXIS',
            fundingSource: 'debit',
            plans: [
                {
                    type: 'standard',
                    tenureMonths: 3,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 5410233, currency: 'INR' },
                        totalPayableAmount: { value: 16230700, currency: 'INR' },
                        totalInterestAmount: { value: 730800, currency: 'INR' }
                    },
                    offers: []
                }
            ]
        },
        {
            issuerName: 'Kotak Mahindra Bank',
            issuerCode: 'KOTAK',
            fundingSource: 'credit',
            plans: [
                {
                    type: 'standard',
                    tenureMonths: 12,
                    interestRateBps: 1200,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 1450000, currency: 'INR' },
                        totalPayableAmount: { value: 17400000, currency: 'INR' },
                        totalInterestAmount: { value: 1900100, currency: 'INR' }
                    }
                }
            ]
        }
    ]
};

/** The backend answers with an empty list when no plan is available for the amount. */
export const emiPlansEmptyResponseMock: EmiPlansResponse = { issuers: [] };
