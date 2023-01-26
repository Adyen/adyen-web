import { h, RefObject } from 'preact';
import { PayButtonFunctionProps } from '../../types';
import PixInput from './PixInput';

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
    onChange({ data, valid, errors, isValid: boolean }): void;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    ref(ref: RefObject<typeof PixInput>): void;
}
