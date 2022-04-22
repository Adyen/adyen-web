import Language from '../../../language/Language';

export interface PhoneInputComponentProps {
    onChange: (state) => void;
    onValid: () => void;
    payButton: () => void;

    selected: string;
    items: [];
    minLength: number;
    prefixName: string;
    phoneName: string;
    showPayButton: boolean;
    isValid: boolean;
    i18n?: Language;
    data?: {
        phonePrefix: string;
        phoneNumber: string;
    };
}

export interface PhoneInputState {
    data?: {
        phonePrefix: string;
        phoneNumber: string;
    };
    errors?: {
        phoneNumber?: boolean;
        phonePrefix?: boolean;
    };
    isValid?: boolean;
}

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}
