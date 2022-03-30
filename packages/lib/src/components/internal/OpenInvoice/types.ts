import { AddressData, FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { CompanyDetailsSchema } from '../CompanyDetails/types';

export interface OpenInvoiceVisibility {
    companyDetails?: FieldsetVisibility;
    personalDetails?: FieldsetVisibility;
    billingAddress?: FieldsetVisibility;
    deliveryAddress?: FieldsetVisibility;
    bankAccount?: FieldsetVisibility;
}

export interface BankDetailsSchema {
    countryCode: any, //TODO
    iban: any,
    ownerName: string
}

export interface OpenInvoiceProps {
    allowedCountries?: string[];
    consentCheckboxLabel: any;
    countryCode?: string;
    data: {
        companyDetails?: CompanyDetailsSchema;
        personalDetails?: PersonalDetailsSchema;
        billingAddress?: AddressData;
        deliveryAddress?: AddressData;
        bankAccount?: BankDetailsSchema
    };
    onChange: Function;
    payButton: any;
    showPayButton?: boolean;
    visibility?: OpenInvoiceVisibility;
    personalDetailsRequiredFields?: string[];
}

export interface OpenInvoiceStateData {
    companyDetails?: CompanyDetailsSchema;
    personalDetails?: PersonalDetailsSchema;
    billingAddress?: AddressData;
    deliveryAddress?: AddressData;
    bankAccount?: BankDetailsSchema
    consentCheckbox?: boolean;
}

export interface OpenInvoiceStateError {
    consentCheckbox?: boolean;
    companyDetails?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
    bankAccount?: boolean;
}

export interface OpenInvoiceStateValid {
    consentCheckbox?: boolean;
    companyDetails?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
    bankAccount?: boolean;
}

export interface OpenInvoiceActiveFieldsets {
    companyDetails: boolean;
    personalDetails: boolean;
    billingAddress: boolean;
    deliveryAddress: boolean;
    bankAccount: boolean;
}

export interface OpenInvoiceFieldsetsRefs {
    companyDetails?;
    personalDetails?;
    billingAddress?;
    deliveryAddress?;
    bankAccount?;
}
