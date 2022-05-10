import { UIElementProps } from '../../../types';

export interface MBWayInputData {
    telephoneNumber?: string;
}

export interface MBWayInputProps extends UIElementProps {
    data?: MBWayInputData;
    placeholders?: MBWayInputData;
    onChange: (state) => void;
    allowedCountries: string[];
}

export interface MBWayDataState {
    telephoneNumber?: string;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
