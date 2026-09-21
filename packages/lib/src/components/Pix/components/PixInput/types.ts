import { h, RefObject } from 'preact';
import PixInput from './PixInput';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';

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
    payButton(props: PayButtonProps): h.JSX.Element;
    ref(ref: RefObject<typeof PixInput>): void;
}
