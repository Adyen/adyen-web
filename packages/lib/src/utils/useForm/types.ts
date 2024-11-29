import { ValidatorRules } from '../Validator/types';
import { FormatterFn } from '../Formatters/types';

export type FormState<FormSchema> = {
    schema?: string[];
    data: FormSchema;
    errors: {
        [key: string]: any;
    };
    valid: {
        [key: string]: boolean;
    };
    fieldProblems?: {
        [key: string]: any;
    };
    isValid?: boolean;
};

export interface Formatter {
    formatterFn?: FormatterFn;
    format?: string;
    maxlength?: number;
}

export type FormProps = {
    rules?: ValidatorRules;
    formatters?: {
        [key: string]: Formatter | Function;
    };
    [key: string]: any;
};

export type HandleChangeForModeType = 'input' | 'blur';

export interface Form<FormSchema> extends FormState<FormSchema> {
    handleChangeFor: (key: string, mode?: HandleChangeForModeType) => (e: any) => void;
    triggerValidation: (schema?: any) => void;
    setSchema: (schema: any) => void;
    setData: (key: string, value: any) => void;
    mergeData: (data: FormSchema) => void;
    setValid: (key: string, value: any) => void;
    setErrors: (key: string, value: any) => void;
    mergeForm: (formValue: any) => void;
    setFieldProblems: (fieldProblems: any) => void;
}
