import { FieldsetVisibility } from '../../../types';
import { ValidatorRules } from '../../../utils/Validator/types';

export interface CompanyDetailsSchema {
    name?: string;
    registrationNumber?: string;
}

export interface CompanyDetailsProps {
    label?: string;
    namePrefix?: string;
    requiredFields?: string[];
    visibility?: FieldsetVisibility;
    data: CompanyDetailsSchema;
    onChange: (newState: object) => void;
    readonly?: boolean;
    ref?: any;
    validationRules?: ValidatorRules;
    setComponentRef?: (ref) => void;
}

export interface ReadOnlyCompanyDetailsProps {
    name?: string;
    registrationNumber?: string;
}
