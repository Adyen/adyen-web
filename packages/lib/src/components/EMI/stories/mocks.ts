import type { EmiIssuer, EmiPaymentMethodEntry, EmiPlansResponse, EmiProcessingAmounts } from '../types';

export const EMI_FIXTURE_CHECKOUT_AMOUNT = { value: 15499900, currency: 'INR' };

export const emiPaymentMethodMock: { type: 'emi'; name: string } & EmiPaymentMethodEntry = {
    type: 'emi',
    name: 'EMI',
    supportedPaymentMethods: [{ type: 'scheme', name: 'Cards', brands: ['visa', 'mc'] }],
    configuration: { emiToken: 'test-emi-token' }
};

const processingAmounts: EmiProcessingAmounts = {
    totalAmount: { value: 35282, currency: 'INR' },
    feeAmount: { value: 29900, currency: 'INR' },
    taxAmount: { value: 5382, currency: 'INR' },
    type: 'absolute',
    message: '299 + GST is Applicable'
};

const percentageProcessingAmounts: EmiProcessingAmounts = {
    totalAmount: { value: 35282, currency: 'INR' },
    feeAmount: { value: 29900, currency: 'INR' },
    taxAmount: { value: 5382, currency: 'INR' },
    maxAmount: { value: 29900, currency: 'INR' },
    type: 'percentage',
    message: '2.99% or 299 (whichever is lower) +GST'
};

export const emiPlansResponseMock: EmiPlansResponse = {
    issuers: [
        {
            issuerName: 'HDFC Bank',
            issuerCode: 'HDFC',
            fundingSource: 'credit',
            availablePlanTypes: ['noCost', 'standard'],
            bestOffer: { value: 1958255, currency: 'INR' },
            termLink: 'https://www.hdfc.bank.in/easyemi/credit-card',
            plans: [
                {
                    type: 'noCost',
                    tenureMonths: 3,
                    interestRateBps: 1800,
                    transactionAmounts: {
                        authorizationAmount: { value: 13541645, currency: 'INR' },
                        totalPayableAmount: { value: 13949910, currency: 'INR' },
                        monthlyPayableAmount: { value: 4649970, currency: 'INR' },
                        totalInterestAmount: { value: 408265, currency: 'INR' },
                        totalInstantDiscountAmount: { value: 1958255, currency: 'INR' },
                        interestDiscountAmount: { value: 408265, currency: 'INR' },
                        additionalDiscountAmount: { value: 1549990, currency: 'INR' }
                    },
                    processingAmounts,
                    offers: [{ offerId: 'offer-hdfc-cashback' }, { offerId: 'offer-hdfc-nocost' }]
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
                        interestDiscountAmount: { value: 150000, currency: 'INR' }
                    },
                    processingAmounts: percentageProcessingAmounts,
                    offers: [{ offerId: 'offer-icici-lowcost' }]
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

export const emiPlansEmptyResponseMock: EmiPlansResponse = { issuers: [] };

export const emiDebitIssuerMock: EmiIssuer = {
    issuerName: 'Axis Bank',
    issuerCode: 'AXIS',
    fundingSource: 'debit',
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
            processingAmounts
        }
    ]
};
