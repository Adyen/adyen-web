import type { PaymentAmount } from '../../../types/global-types';

export type EMIOfferType = 'noCostEmi' | 'instantDiscount' | 'cashback';

export interface EMIOffer {
    id: string;
    type: EMIOfferType;
    bank?: string;
    brand?: string;
    tag: string;
    description: string;
    minAmount?: PaymentAmount;
    discountAmount?: PaymentAmount;
    fixedAmount?: PaymentAmount;
    applicableTenures?: number[];
}

export interface EMIPlan {
    tenure: number;
    interestRate: number;
}

export interface EMIInstallmentOptions {
    values?: number[];
    plans?: EMIPlan[];
}

export interface EMIDetailItemConfiguration {
    installmentOptions?: Record<string, EMIInstallmentOptions>;
}

export interface EMIDetailItem {
    id: string;
    name: string;
    brands?: string[];
    configuration?: EMIDetailItemConfiguration;
}

export interface EMIDetail {
    key: string;
    type: string;
    items: EMIDetailItem[];
}

export interface EMIPaymentMethodData {
    name: string;
    type: 'emi';
    offers: EMIOffer[];
    details: EMIDetail[];
}
