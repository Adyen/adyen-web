import Language from '../../../../language/Language';
import { StylesObject } from '../../../internal/SecuredFields/lib/types';
import UIElement from '../../../internal/UIElement/UIElement';
import { Resources } from '../../../../core/Context/Resources';

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

type PlaceholderKeys = 'holderName' | 'bankAccountNumber' | 'bankLocationId';

export type Placeholders = Partial<Record<PlaceholderKeys, string>>;

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
    showContextualElement?: boolean;
    ref?: any;
    resources: Resources;
    showPayButton?: boolean;
    showWarnings?: boolean;
    styles?: StylesObject;
    type?: string;
    forceCompat?: boolean;
    setComponentRef?: (ref) => void;
    showFormInstruction?: boolean;
}
