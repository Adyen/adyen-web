import { AddressData, FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { CompanyDetailsSchema } from '../CompanyDetails/types';
import { AddressSpecifications } from '../Address/types';

export interface OpenInvoiceVisibility {
    companyDetails?: FieldsetVisibility;
    personalDetails?: FieldsetVisibility;
    billingAddress?: FieldsetVisibility;
    deliveryAddress?: FieldsetVisibility;
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
    };
    onChange: Function;
    payButton: any;
    showPayButton?: boolean;
    visibility?: OpenInvoiceVisibility;
    personalDetailsRequiredFields?: string[];
    billingAddressRequiredFields?: string[];
    billingAddressSpecification?: AddressSpecifications;
}

export interface OpenInvoiceStateData {
    companyDetails?: CompanyDetailsSchema;
    personalDetails?: PersonalDetailsSchema;
    billingAddress?: AddressData;
    deliveryAddress?: AddressData;
    consentCheckbox?: boolean;
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

export interface OpenInvoiceActiveFieldsets {
    companyDetails: boolean;
    personalDetails: boolean;
    billingAddress: boolean;
    deliveryAddress: boolean;
}

export interface OpenInvoiceFieldsetsRefs {
    companyDetails?;
    personalDetails?;
    billingAddress?;
    deliveryAddress?;
}
