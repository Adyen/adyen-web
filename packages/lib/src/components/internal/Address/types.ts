import { AddressField, AddressSchema } from '../../../types';

export interface AddressProps {
    allowedCountries?: string[];
    countryCode?: string;
    data?: object;
    label?: string;
    onChange: (newState) => void;
    requiredFields?: string[];
    ref?: any;
    visibility?: string;
}

export interface AddressStateError {
    street?: boolean;
    houseNumberOrName?: boolean;
    postalCode?: boolean;
    city?: boolean;
    country?: boolean;
    stateOrProvince?: boolean;
}

export interface AddressStateValid {
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
    data: AddressSchema;
    errors: AddressStateError;
    fieldName: string;
    onInput: (e: Event) => void;
    onCountryChange: (e: Event) => void;
    onStateChange: (e: Event) => void;
    readOnly?: boolean;
}

export interface ReadOnlyAddressProps {
    data: AddressSchema;
    label: string;
}

export interface CountryFieldProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    errorMessage: boolean;
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
    selectedCountry: string;
    errorMessage: boolean;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    value: string;
}

export interface StateFieldItem {
    id: string;
    name: string;
}

type AddressSchemaGroupedFields = [AddressField, number][];

export type AddressSchemas = {
    [key: string]: (AddressField | AddressSchemaGroupedFields)[];
};

export type AddressLabels = {
    [label: string]: {
        [key: string]: string;
    };
};
