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
