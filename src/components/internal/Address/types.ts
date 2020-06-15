export interface AddressObject {
    city: string;
    country: boolean | string;
    houseNumberOrName: string;
    postalCode: string;
    street: string;
    stateOrProvince: boolean | string;
}

export interface BillingAddress {
    data: AddressObject;
    isValid: boolean;
}

export interface AddressProps {
    allowedCountries?: string[];
    countryCode?: string;
    data?: object;
    label?: string;
    onChange: Function;
    requiredFields?: string[];
    ref?: any;
    visibility?: string;
}