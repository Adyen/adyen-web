import { AddressField, AddressData } from '../../../types';
import Specifications from './Specifications';

export interface AddressProps {
    allowedCountries?: string[];
    countryCode?: string;
    data?: object;
    label?: string;
    onChange: (newState) => void;
    requiredFields?: string[];
    ref?: any;
    specifications?: AddressSpecifications;
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

export interface FieldContainerProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    data: AddressData;
    errors: AddressStateError;
    fieldName: string;
    key: string;
    onInput: (e: Event) => void;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    specifications: Specifications;
}

export interface ReadOnlyAddressProps {
    data: AddressData;
    label: string;
}

export interface CountryFieldProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    label: string;
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
    label: string;
    errorMessage: boolean;
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
        labels?: {
            [key: string]: string;
        };
        optionalFields?: AddressField[];
        schema?: AddressSchema;
    };
}
