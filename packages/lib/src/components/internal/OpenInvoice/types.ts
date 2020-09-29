import { AddressSchema, FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { CompanyDetailsSchema } from '../CompanyDetails/types';

export interface OpenInvoiceProps {
    allowedCountries?: string[];
    consentCheckboxLabel: any;
    countryCode: string;
    data: {
        companyDetails?: CompanyDetailsSchema;
        personalDetails?: PersonalDetailsSchema;
        billingAddress?: AddressSchema;
        deliveryAddress?: AddressSchema;
    };
    onChange: Function;
    payButton: any;
    showPayButton?: boolean;
    visibility?: {
        companyDetails?: FieldsetVisibility;
        personalDetails?: FieldsetVisibility;
        billingAddress?: FieldsetVisibility;
        deliveryAddress?: FieldsetVisibility;
    };
    personalDetailsRequiredFields?: string[];
}

export interface OpenInvoiceStateData {
    companyDetails?: CompanyDetailsSchema;
    personalDetails?: PersonalDetailsSchema;
    billingAddress?: AddressSchema;
    deliveryAddress?: AddressSchema;
    consentCheckbox?: boolean;
    separateDeliveryAddress?: boolean;
}

export interface OpenInvoiceStateError {
    consentCheckbox?: boolean;
    companyDetails?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
}

export interface OpenInvoiceStateValid {
    consentCheckbox?: boolean;
    companyDetails?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
}

export interface ActiveFieldsets {
    companyDetails: boolean;
    personalDetails: boolean;
    billingAddress: boolean;
    deliveryAddress: boolean;
}

export interface FieldsetsRefs {
    companyDetails?;
    personalDetails?;
    billingAddress?;
    deliveryAddress?;
}
