import { AddressField, AddressData } from '../../../types';
import Specifications from './Specifications';
import { ValidatorRules } from '../../../utils/Validator/types';
import { ValidationRuleResult } from '../../../utils/Validator/ValidationRuleResult';

// Describes an object with unknown keys whose value is always a string
export type StringObject = {
    [key: string]: string;
};

export interface AddressProps {
    allowedCountries?: string[];
    countryCode?: string;
    data?: object;
    label?: string;
    onChange: (newState) => void;
    requiredFields?: string[];
    ref?: any;
    specifications?: AddressSpecifications;
    validationRules?: ValidatorRules;
    visibility?: string;
    overrideSchema?: AddressSpecifications;
    iOSFocusedField?: string;
    payButton?: (obj) => {};
    showPayButton?: boolean;
    setComponentRef?: (ref) => void;
}

export interface AddressStateError {
    street?: ValidationRuleResult;
    houseNumberOrName?: ValidationRuleResult;
    postalCode?: ValidationRuleResult;
    city?: ValidationRuleResult;
    country?: ValidationRuleResult;
    stateOrProvince?: ValidationRuleResult;
}

export interface FieldContainerProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    data: AddressData;
    errors: AddressStateError;
    fieldName: string;
    key: string;
    valid?: object;
    onInput?: (e: Event) => void;
    onBlur?: (e: Event) => void;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    specifications: Specifications;
    maxlength?: number;
    trimOnBlur?: boolean;
    disabled?: boolean;
}

export interface ReadOnlyAddressProps {
    data: AddressData;
    label: string;
}

export interface CountryFieldProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    label: string;
    errorMessage: boolean | string;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    value: string;
}

export interface CountryFieldItem {
    id: string;
    name: string;
}

export interface StateFieldProps {
    classNameModifiers: string[];
    label: string;
    errorMessage: boolean | string;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    selectedCountry: string;
    specifications: Specifications;
    value: string;
}

export interface StateFieldItem {
    id: string;
    name: string;
}

type AddressFieldsGroup = [AddressField, number][];
export type AddressSchema = (AddressField | AddressFieldsGroup)[];

export interface AddressSpecifications {
    [key: string]: {
        hasDataset?: boolean;
        labels?: StringObject;
        optionalFields?: AddressField[];
        placeholders?: StringObject;
        schema?: AddressSchema;
    };
}
