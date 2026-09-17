import type { EmiIssuer, EmiPlansResponse, EmiProcessingAmounts } from '../types';

/** Minor units, mirroring the design screenshots (₹1,54,999.00 checkout amount). */
export const EMI_FIXTURE_CHECKOUT_AMOUNT = { value: 15499900, currency: 'INR' };

/** The lookup quotes the same processing fee on every plan, and words the shopper-facing sentence itself. */
const processingAmounts: EmiProcessingAmounts = {
    totalAmount: { value: 35282, currency: 'INR' },
    feeAmount: { value: 29900, currency: 'INR' },
    taxAmount: { value: 5382, currency: 'INR' },
    type: 'absolute',
    message: '299 + GST is Applicable'
};

/**
 * Raw `POST /paymentMethods/emi/plans` response, and the single fixture behind the Storybook handler,
 * the Playwright route mock and the unit tests.
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
                        monthlyPayableAmount: { value: 5166633, currency: 'INR' },
                        totalPayableAmount: { value: 15499900, currency: 'INR' },
                        totalInterestAmount: { value: 400000, currency: 'INR' },
                        instantDiscountAmount: { value: 400000, currency: 'INR' }
                    },
                    processingAmounts,
                    // The larger offer is the one shown, and the only one the payment request applies
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
                    },
                    processingAmounts
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
                        monthlyPayableAmount: { value: 5236650, currency: 'INR' },
                        totalPayableAmount: { value: 15709950, currency: 'INR' },
                        totalInterestAmount: { value: 420100, currency: 'INR' },
                        instantDiscountAmount: { value: 210050, currency: 'INR' }
                    },
                    processingAmounts,
                    offers: [{ offerId: 'offer-icici-lowcost', type: 'DISCOUNT', amount: { value: 210050, currency: 'INR' } }]
                },
                {
                    type: 'standard',
                    tenureMonths: 9,
                    interestRateBps: 1599,
                    transactionAmounts: {
                        monthlyPayableAmount: { value: 1933322, currency: 'INR' },
                        totalPayableAmount: { value: 17399900, currency: 'INR' },
                        totalInterestAmount: { value: 1900000, currency: 'INR' }
                    },
                    processingAmounts
                }
            ]
        },
        {
            issuerName: 'Axis Bank',
            issuerCode: 'AXIS',
            fundingSource: 'credit',
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
                    processingAmounts,
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
                    },
                    processingAmounts
                }
            ]
        }
    ]
};

/** The backend answers with an empty list when no plan is available for the amount. */
export const emiPlansEmptyResponseMock: EmiPlansResponse = { issuers: [] };

/** The shape the response takes once debit EMI ships. This version renders credit plans only, so it drops this issuer. */
export const emiDebitIssuerMock: EmiIssuer = {
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
            processingAmounts
        }
    ]
};

/** A shopper offered debit plans only, by a version that renders none of them. */
export const emiPlansDebitOnlyResponseMock: EmiPlansResponse = { issuers: [emiDebitIssuerMock] };
