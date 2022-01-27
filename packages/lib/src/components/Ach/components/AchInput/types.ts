import Language from '../../../../language/Language';
import { StylesObject } from '../../../internal/SecuredFields/lib/types';

export interface ACHInputStateValid {
    holderName?: boolean;
    billingAddress?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface ACHInputStateError {
    holderName?: boolean;
    billingAddress?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface ACHInputDataState {
    holderName?: string;
    billingAddress?: object;
}

type Placeholders = {
    holderName?: string;
};

export interface ACHInputProps {
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    clientKey: string;
    data?: ACHInputDataState;
    hasHolderName?: boolean;
    holderName?: string;
    holderNameRequired?: boolean;
    i18n?: Language;
    keypadFix?: boolean;
    legacyInputMode?: boolean;
    loadingContext: string;
    onAllValid?: () => {};
    onBlur?: (e) => {};
    onChange?: ({}) => {};
    onConfigSuccess?: () => {};
    onError?: () => {};
    onFieldValid?: () => {};
    onFocus?: (e) => {};
    onLoad?: () => {};
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    showPayButton?: boolean;
    showWarnings?: boolean;
    styles?: StylesObject;
    type?: string;
}
