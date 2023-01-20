import { FieldsetVisibility, PersonalDetailsSchema } from '../../../types';
import { ValidatorRules } from '../../../utils/Validator/types';
import { SRPanel } from '../../../core/Errors/SRPanel';
import Analytics from '../../../core/Analytics';
import RiskElement from '../../../core/RiskModule';

type PersonalDetailsPlaceholders = Omit<PersonalDetailsSchema, 'gender'>;

export interface PersonalDetailsProps {
    label?: string;
    namePrefix?: string;
    requiredFields?: string[];
    visibility?: FieldsetVisibility;
    data: PersonalDetailsSchema;
    modules?: {
        srPanel: SRPanel;
        analytics: Analytics;
        risk: RiskElement;
    };
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

// An interface for the members exposed by CardInput to its parent Card/UIElement
export interface PersonalDetailsRef {
    showValidation?: (who) => void;
}
