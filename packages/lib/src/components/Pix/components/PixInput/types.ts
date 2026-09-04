import { h } from 'preact';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';
import { ComponentMethodsRef } from '../../../types';

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
    setComponentRef: (ref: ComponentMethodsRef) => void;
}
