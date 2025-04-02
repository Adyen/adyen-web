import Language from '../../../../language/Language';
import { StylesObject } from '../../../internal/SecuredFields/lib/types';
import UIElement from '../../../internal/UIElement/UIElement';
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

type PlaceholderKeys = 'holderName' | 'bankAccountNumber' | 'bankLocationId';

export type Placeholders = Partial<Record<PlaceholderKeys, string>>;

export interface AchPlaceholders {
    accountTypeSelector?: string;
    ownerName?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountNumberVerification?: string;
}

export interface ACHInputProps {
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
    showContextualElement?: boolean;
    ref?: any;
    resources: Resources;
    showPayButton?: boolean;
    showWarnings?: boolean;
    styles?: StylesObject;
    type?: string;
    forceCompat?: boolean;
    setComponentRef?: (ref) => void;
    handleKeyPress?: (obj: KeyboardEvent) => void;
}
