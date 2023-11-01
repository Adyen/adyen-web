import { UIElementProps } from '../../../internal/UIElement/types';

export interface MBWayInputData {
    telephoneNumber?: string;
    phoneNumber?: string;
    phonePrefix?: string;
}

export interface MBWayInputProps extends UIElementProps {
    data?: MBWayInputData;
    placeholders?: MBWayInputData;
    onChange: (state) => void;
    allowedCountries?: string[];
    requiredFields?: string[];
    phoneNumberKey?: string;
}

export interface MBWayDataState {
    telephoneNumber?: string;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
