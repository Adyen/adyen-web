import { h } from 'preact';
import { FieldsetVisibility, PersonalDetailsSchema } from '../../../types/global-types';
import { ValidatorRules } from '../../../utils/Validator/types';
import { ComponentMethodsRef } from '../../types';
import { PayButtonProps } from '../PayButton/PayButton';

type PersonalDetailsPlaceholders = PersonalDetailsSchema;

export interface PersonalDetailsProps {
    label?: string;
    namePrefix?: string;
    requiredFields?: string[];
    visibility?: FieldsetVisibility;
    data: PersonalDetailsSchema;
    onChange: (newState: object) => void;
    placeholders?: PersonalDetailsPlaceholders;
    readonly?: boolean;
    ref?: any;
    validationRules?: ValidatorRules;
    setComponentRef?: (ref: ComponentMethodsRef) => void;
    payButton?: (options: PayButtonProps) => h.JSX.Element;
}

export interface PersonalDetailsStateError {
    firstName?: boolean;
    lastName?: boolean;
    dateOfBirth?: string | boolean;
    shopperEmail?: boolean;
    telephoneNumber?: string | boolean;
}

export interface PersonalDetailsStateValid {
    firstName?: boolean;
    lastName?: boolean;
    dateOfBirth?: boolean;
    shopperEmail?: boolean;
    telephoneNumber?: boolean;
}

export interface ReadOnlyPersonalDetailsProps {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
}

export interface ValidationResult {
    errorMessage: string;
    isValid: boolean;
}
