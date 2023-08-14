import { UIElementProps } from '../../types';

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
    showFormInstruction?: boolean;
    showContextualElement?: boolean;
    contextualTexts?: BacsInputData;
}

export interface BacsDataState {
    holderName?: string;
    bankAccountNumber?: string;
    bankLocationId?: string;
    shopperEmail?: string;
    amountConsentCheckbox?: boolean;
    accountConsentCheckbox?: boolean;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
