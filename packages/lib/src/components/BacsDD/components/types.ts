import { UIElementProps } from '../../UIElement';

export interface BacsInputData {
    holderName?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
}

export interface BacsInputProps extends UIElementProps {
    data?: BacsInputData;
    placeholders?: BacsInputData;
    onChange: (state) => void;
}

export interface BacsDataState {
    holderName?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface BacsErrorsState {
    holderName?: boolean;
    telephoneNumber?: boolean;
    shopperEmail?: boolean;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface BacsValidState {
    holderName?: boolean;
    telephoneNumber?: boolean;
    shopperEmail?: boolean;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
