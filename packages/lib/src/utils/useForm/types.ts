import { ValidatorRules } from '../Validator/types';

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

export type FormProps = {
    rules?: ValidatorRules;
    [key: string]: any;
};

export interface Form<FormSchema> extends FormState<FormSchema> {
    handleChangeFor: (key: string, mode?: string) => (e: any) => void;
    triggerValidation: (schema?: any) => void;
    setSchema: (schema: any) => void;
    setData: (key: string, value: any) => void;
    setValid: (key: string, value: any) => void;
    setErrors: (key: string, value: any) => void;
    mergeForm: (formValue: any) => void;
    setFieldProblems: (fieldProblems: any) => void;
}
