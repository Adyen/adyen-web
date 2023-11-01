import { h, RefObject } from 'preact';
import PixInput from './PixInput';
import { PayButtonFunctionProps } from '../../internal/UIElement/types';

export interface PixInputDataState {
    firstName?: string;
    lastName?: string;
    socialSecurityNumber?: string;
}

export interface PixInputProps {
    name: string;
    data?: {
        firstName: string;
        lastName: string;
        socialSecurityNumber: string;
    };
    personalDetailsRequired: boolean;
    showPayButton: boolean;
    onChange({ data, valid, errors, isValid }): void;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    ref(ref: RefObject<typeof PixInput>): void;
}
