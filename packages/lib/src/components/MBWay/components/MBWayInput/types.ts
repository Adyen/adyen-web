import { UIElementProps } from '../../../UIElement';

export interface MBWayInputData {
    telephoneNumber?: string;
}

export interface MBWayInputProps extends UIElementProps {
    data?: MBWayInputData;
    placeholders?: MBWayInputData;
    onChange: (state) => void;
}

export interface MBWayDataState {
    telephoneNumber?: string;
}

export interface MBWayErrorsState {
    telephoneNumber?: boolean;
}

export interface MBWayValidState {
    telephoneNumber?: boolean;
}

export interface ValidationObject {
    value: string;
    isValid: boolean;
    showError: boolean;
}
