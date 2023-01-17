import { FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { ValidatorRules } from '../../../utils/Validator/types';
import { BinLookupResponse } from '../../Card/types';
import { CbObjOnError, StylesObject } from '../SecuredFields/lib/types';

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

// An interface for the members exposed by CardInput to its parent Card/UIElement
export interface PersonalDetailsRef {
    showValidation?: (who) => void;
}
