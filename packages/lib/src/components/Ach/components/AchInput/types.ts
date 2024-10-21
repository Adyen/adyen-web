import Language from '../../../../language/Language';
import { StylesObject } from '../../../internal/SecuredFields/lib/types';
import UIElement from '../../../UIElement';
import { Resources } from '../../../../core/Context/Resources';

export interface ACHInputStateValid {
    holderName?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface ACHInputStateError {
    holderName?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface ACHInputDataState {
    bankAccountType?: 'savings' | 'checking';
    holderName?: string;
}

type Placeholders = {
    holderName?: string;
};

export interface ACHInputProps {
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
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
    resources: Resources;
    showPayButton?: boolean;
    showWarnings?: boolean;
    styles?: StylesObject;
    type?: string;
    forceCompat?: boolean;
    setComponentRef?: (ref) => void;
    showFormInstruction?: boolean;
}
