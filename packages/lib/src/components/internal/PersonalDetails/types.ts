import { FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { ValidatorRules } from '../../../utils/Validator/types';

type PersonalDetailsPlaceholders = Omit<PersonalDetailsSchema, 'gender'>;

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
    setComponentRef?: (ref) => void;
    payButton?: (obj) => {};
    showPayButton?: boolean;
}

export interface PersonalDetailsStateError {
    firstName?: boolean;
    lastName?: boolean;
    gender?: boolean;
    dateOfBirth?: string | boolean;
    shopperEmail?: boolean;
    telephoneNumber?: string | boolean;
}

export interface PersonalDetailsStateValid {
    firstName?: boolean;
    lastName?: boolean;
    gender?: boolean;
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
