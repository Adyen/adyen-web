import { DataSet, DataSetItem } from '../../../core/Services/data-set';
import { ComponentMethodsRef } from '../UIElement/types';

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}

export interface PhoneInputFormProps {
    items: DataSet;
    requiredFields?: string[];
    data: PhoneInputSchema;
    onChange: (data: { data: PhoneInputSchema; valid: { [p: string]: boolean }; errors: { [p: string]: any }; isValid: boolean }) => void;
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
