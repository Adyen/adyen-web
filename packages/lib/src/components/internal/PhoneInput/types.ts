import { DataSet, DataSetItem } from '../../../core/Services/data-set';

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}

export interface PhoneInputProps {
    items: DataSet;
    requiredFields?: string[];
    data: {
        phonePrefix?: string;
        phoneNumber?: string;
    };
    onChange: (obj) => void;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: PhoneInputSchema;
    ref?;
}

export interface PhonePrefixes {
    phonePrefixes: DataSetItem[];
    loadingStatus: string;
}
