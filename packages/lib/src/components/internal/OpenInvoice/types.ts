import { AddressData, FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { CompanyDetailsSchema } from '../CompanyDetails/types';
import { AddressSpecifications } from '../Address/types';
import { UIElementProps } from '../../types';
import UIElement from '../../UIElement';
import { GenericError, ValidationRuleErrorObj } from '../../../core/Errors/types';

export interface OpenInvoiceVisibility {
    companyDetails?: FieldsetVisibility;
    personalDetails?: FieldsetVisibility;
    billingAddress?: FieldsetVisibility;
    deliveryAddress?: FieldsetVisibility;
    bankAccount?: FieldsetVisibility;
}

export interface BankDetailsSchema {
    countryCode?: string;
    ibanNumber?: any;
    ownerName?: string;
}

export interface OpenInvoiceProps extends UIElementProps {
    allowedCountries?: string[];
    consentCheckboxLabel: any;
    countryCode?: string;
    data: {
        companyDetails?: CompanyDetailsSchema;
        personalDetails?: PersonalDetailsSchema;
        billingAddress?: AddressData;
        deliveryAddress?: AddressData;
        bankAccount?: BankDetailsSchema;
    };
    onChange: (state: any, element?: UIElement) => void;
    payButton: any;
    showPayButton?: boolean;
    visibility?: OpenInvoiceVisibility;
    personalDetailsRequiredFields?: string[];
    billingAddressRequiredFields?: string[];
    billingAddressSpecification?: AddressSpecifications;
    setComponentRef?: (ref) => void;
}

export interface OpenInvoiceStateData {
    companyDetails?: CompanyDetailsSchema;
    personalDetails?: PersonalDetailsSchema;
    billingAddress?: AddressData;
    deliveryAddress?: AddressData;
    bankAccount?: BankDetailsSchema;
    consentCheckbox?: boolean;
}

export interface OpenInvoiceStateError {
    consentCheckbox?: boolean | GenericError;
    companyDetails?: boolean | ValidationRuleErrorObj;
    billingAddress?: boolean | ValidationRuleErrorObj;
    deliveryAddress?: boolean | ValidationRuleErrorObj;
    personalDetails?: boolean | ValidationRuleErrorObj;
    bankAccount?: boolean | object;
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

// An interface for the members exposed by a component to its parent UIElement
export interface OpenInvoiceRef {
    showValidation?: (who) => void;
    setStatus?: any;
}
