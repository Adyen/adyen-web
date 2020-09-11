import { FieldsetVisibility } from '../../../types';
import Validator from '../../../utils/Validator';

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
    validator?: Validator;
}

export interface CompanyDetailsStateError {
    name?: boolean;
    registrationNumber?: boolean;
}

export interface CompanyDetailsStateValid {
    name?: boolean;
    registrationNumber?: boolean;
}

export interface ReadOnlyCompanyDetailsProps {
    name?: string;
    registrationNumber?: string;
}
