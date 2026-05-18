import { DataSet, DataSetItem } from '../../../core/Services/data-set';
import { ComponentMethodsRef } from '../UIElement/types';
import type { ValidationRuleResult } from '../../../utils/Validator/ValidationRuleResult';

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}

export interface PhoneInputFormProps {
    items: DataSet;
    requiredFields?: string[];
    data: PhoneInputSchema;
    onChange: (data: {
        data: PhoneInputSchema;
        valid: { [p: string]: boolean };
        errors: { [p: string]: ValidationRuleResult };
        isValid: boolean;
    }) => void;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: PhoneInputSchema;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export interface PhonePrefixes {
    phonePrefixes: DataSetItem[];
    loadingStatus: string;
}
