import { FieldsetVisibility } from '../../../types/global-types';
import { ValidatorRules } from '../../../utils/Validator/types';
import type { ComponentMethodsRef } from '../UIElement/types';

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
    validationRules?: ValidatorRules;
    setComponentRef?: (ref: ComponentMethodsRef) => void;
}

export interface ReadOnlyCompanyDetailsProps {
    name?: string;
    registrationNumber?: string;
}
