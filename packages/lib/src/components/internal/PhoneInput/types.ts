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
    onChange: (obj) => void;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: PhoneInputSchema;
    ref?;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export interface PhonePrefixes {
    phonePrefixes: DataSetItem[];
    loadingStatus: string;
}
