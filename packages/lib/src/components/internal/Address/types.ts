import { AddressField, AddressData } from '../../../types';
import Specifications from './Specifications';
import { ValidatorRules } from '../../../utils/Validator/Validator';

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
    collateErrors?: boolean;
}

export interface AddressStateError {
    street?: boolean;
    houseNumberOrName?: boolean;
    postalCode?: boolean;
    city?: boolean;
    country?: boolean;
    stateOrProvince?: boolean;
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
    onChange?: (e: Event) => void;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    specifications: Specifications;
    collateErrors?: boolean;
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
    collateErrors?: boolean;
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
    collateErrors?: boolean;
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
