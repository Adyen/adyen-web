import Language from '../../../../language/Language';
import { StylesObject } from '../../../internal/SecuredFields/lib/types';
import UIElement from '../../../UIElement';

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
    clientKey?: string;
    data?: ACHInputDataState;
    enableStoreDetails: boolean;
    hasHolderName?: boolean;
    holderName?: string;
    holderNameRequired?: boolean;
    i18n?: Language;
    keypadFix?: boolean;
    legacyInputMode?: boolean;
    loadingContext?: string;
    onAllValid?: () => {};
    onBlur?: (e) => {};
    onChange?: (obj) => void;
    onSubmit?: (obj) => void;
    onConfigSuccess?: () => {};
    onError?: (error: any, element?: UIElement<any>) => void;
    onFieldValid?: () => {};
    onFocus?: (e) => {};
    onLoad?: () => {};
    payButton?: (obj) => {};
    placeholders?: Placeholders;
    ref?: any;
    showPayButton?: boolean;
    showWarnings?: boolean;
    styles?: StylesObject;
    type?: string;
    forceCompat?: boolean;
}
