/**
 * Copied from packages/lib/src/components/EMI/stories/mocks.ts. The e2e package must not import library
 * source, so keep this copy in sync by hand when the plans contract changes.
 */

type Amount = { value: number; currency: string };

type EmiPlanMock = {
    type: string;
    tenureMonths: number;
    interestRateBps: number;
    transactionAmounts: {
        authorizationAmount: Amount;
        monthlyPayableAmount: Amount;
        totalPayableAmount: Amount;
        totalInterestAmount: Amount;
        totalInstantDiscountAmount?: Amount;
        interestDiscountAmount?: Amount;
    };
    processingAmounts?: {
        totalAmount: Amount;
        feeAmount: Amount;
        taxAmount: Amount;
        maxAmount?: Amount;
        type: string;
        message: string;
    };
    offers?: { offerId: string; type: string; description?: string }[];
};

type EmiIssuerMock = {
    issuerName: string;
    issuerCode: string;
    fundingSource: string;
    availablePlanTypes: string[];
    bestOffer?: Amount;
    termLink?: string;
    plans: EmiPlanMock[];
};

type EmiPlansResponseMock = { issuers: EmiIssuerMock[] };

type EmiPlansErrorResponseMock = {
    type: string;
    errorCode: string;
    title: string;
    requestId: string;
    status: number;
};

const processingAmounts: EmiPlanMock['processingAmounts'] = {
    totalAmount: { value: 35282, currency: 'INR' },
    feeAmount: { value: 29900, currency: 'INR' },
    taxAmount: { value: 5382, currency: 'INR' },
    type: 'absolute',
    message: '299 + GST is Applicable'
};

const percentageProcessingAmounts: EmiPlanMock['processingAmounts'] = {
    totalAmount: { value: 35282, currency: 'INR' },
    feeAmount: { value: 29900, currency: 'INR' },
    taxAmount: { value: 5382, currency: 'INR' },
    maxAmount: { value: 29900, currency: 'INR' },
    type: 'percentage',
    message: '2.99% or 299 (whichever is lower) +GST'
};

const emiPlansResponseMock: EmiPlansResponseMock = {
    issuers: [
        {
            issuerName: 'HDFC Bank',
            issuerCode: 'HDFC',
            fundingSource: 'credit',
            availablePlanTypes: ['noCost', 'standard'],
            bestOffer: { value: 400000, currency: 'INR' },
            termLink: 'https://www.hdfc.bank.in/easyemi/credit-card',
            plans: [
                {
                    type: 'noCost',
                    tenureMonths: 3,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        authorizationAmount: { value: 14699900, currency: 'INR' },
                        monthlyPayableAmount: { value: 5166633, currency: 'INR' },
                        totalPayableAmount: { value: 15499900, currency: 'INR' },
                        totalInterestAmount: { value: 400000, currency: 'INR' },
                        totalInstantDiscountAmount: { value: 400000, currency: 'INR' },
                        interestDiscountAmount: { value: 400000, currency: 'INR' }
                    },
                    processingAmounts,
                    offers: [
                        { offerId: 'offer-hdfc-cashback', type: 'CASHBACK', description: 'Cashback' },
                        { offerId: 'offer-hdfc-nocost', type: 'DISCOUNT', description: 'No cost EMI' }
                    ]
                },
                {
                    type: 'standard',
                    tenureMonths: 6,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        authorizationAmount: { value: 15499900, currency: 'INR' },
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
            availablePlanTypes: ['lowCost', 'standard'],
            bestOffer: { value: 210050, currency: 'INR' },
            termLink: 'https://www.icici.bank.in/personal-banking/cards/credit-card/emi-products/instant-emi/terms-and-condition',
            plans: [
                {
                    type: 'lowCost',
                    tenureMonths: 3,
                    interestRateBps: 750,
                    transactionAmounts: {
                        authorizationAmount: { value: 15079800, currency: 'INR' },
                        monthlyPayableAmount: { value: 5236650, currency: 'INR' },
                        totalPayableAmount: { value: 15709950, currency: 'INR' },
                        totalInterestAmount: { value: 420100, currency: 'INR' },
                        totalInstantDiscountAmount: { value: 210050, currency: 'INR' },
                        interestDiscountAmount: { value: 210050, currency: 'INR' }
                    },
                    processingAmounts: percentageProcessingAmounts,
                    offers: [{ offerId: 'offer-icici-lowcost', type: 'DISCOUNT' }]
                },
                {
                    type: 'standard',
                    tenureMonths: 9,
                    interestRateBps: 1599,
                    transactionAmounts: {
                        authorizationAmount: { value: 15499900, currency: 'INR' },
                        monthlyPayableAmount: { value: 1933322, currency: 'INR' },
                        totalPayableAmount: { value: 17399900, currency: 'INR' },
                        totalInterestAmount: { value: 1900000, currency: 'INR' }
                    },
                    processingAmounts: percentageProcessingAmounts
                }
            ]
        },
        {
            issuerName: 'Axis Bank',
            issuerCode: 'AXIS',
            fundingSource: 'credit',
            availablePlanTypes: ['standard'],
            plans: [
                {
                    type: 'standard',
                    tenureMonths: 3,
                    interestRateBps: 1550,
                    transactionAmounts: {
                        authorizationAmount: { value: 15499900, currency: 'INR' },
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
            availablePlanTypes: ['standard'],
            plans: [
                {
                    type: 'standard',
                    tenureMonths: 12,
                    interestRateBps: 1200,
                    transactionAmounts: {
                        authorizationAmount: { value: 15499900, currency: 'INR' },
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

// Problem-details shape, which is what utility/v1/emi/plans answers on failure
const emiPlansErrorResponseMock: EmiPlansErrorResponseMock = {
    type: 'https://docs.adyen.com/errors/internal',
    errorCode: '00_500',
    title: 'An internal error happened',
    requestId: 'e2e-emi-plans-error',
    status: 500
};

export { emiPlansResponseMock, emiPlansErrorResponseMock };
