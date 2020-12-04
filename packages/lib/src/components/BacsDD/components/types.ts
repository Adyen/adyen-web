import { UIElementProps } from '../../UIElement';

export interface BacsInputData {
    holderName?: string;
    bankAccountNumber?: string;
    bankLocationId?: string;
    shopperEmail?: string;
}

export interface BacsInputProps extends UIElementProps {
    data?: BacsInputData;
    placeholders?: BacsInputData;
    onChange: (state) => void;
    onSubmit: () => void;
    onEdit: (e, revertToEnter) => void;
}

export interface BacsDataState {
    holderName?: string;
    bankAccountNumber?: string;
    bankLocationId?: string;
    shopperEmail?: string;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface BacsErrorsState {
    holderName?: boolean;
    bankAccountNumber?: boolean;
    bankLocationId?: boolean;
    shopperEmail?: boolean;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface BacsValidState {
    holderName?: boolean;
    bankAccountNumber?: boolean;
    bankLocationId?: boolean;
    shopperEmail?: boolean;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
