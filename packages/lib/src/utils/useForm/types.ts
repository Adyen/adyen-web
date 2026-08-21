import { FieldContext, ValidatorMode, ValidatorRules } from '../Validator/types';
import { ValidationRuleResult } from '../Validator/ValidationRuleResult';
import type { ValidationResult } from '../Validator/Validator';
import { FormatterFn } from '../Formatters/types';

export type FormStateValid = Record<string, boolean>;
export type FormStateErrors = Record<string, ValidationRuleResult | null>;
export type FormStateFieldProblems = Record<string, string | null>;

export type FormStateLocal<FormSchema> = {
    data: FormSchema;
    valid: FormStateValid;
    errors: FormStateErrors;
    fieldProblems: FormStateFieldProblems;
    isValid?: boolean;
};

export type FormState<FormSchema> = FormStateLocal<FormSchema> & {
    schema: string[];
    local?: FormStateLocal<FormSchema>;
};

export interface Formatter {
    formatterFn?: FormatterFn;
    format?: string;
    maxlength?: number;
}

export type FormProps = {
    schema: string[] | null;
    rules?: ValidatorRules | null;
    formatters?: {
        [key: string]: Formatter | Function;
    } | null;
    [key: string]: unknown;
};

export type HandleChangeForModeType = 'input' | 'blur';

export type FormChangeEventTarget = {
    type?: string;
    value?: unknown;
    name?: string;
};

export interface Form<FormSchema> extends FormState<FormSchema> {
    handleChangeFor: (key: string, mode?: HandleChangeForModeType) => (e: unknown) => void;
    triggerValidation: (schema?: FormState<FormSchema>['schema']) => void;
    setSchema: (schema: FormState<FormSchema>['schema']) => void;
    setData: (key: string, value: unknown) => void;
    mergeData: (data: FormSchema) => void;
    setValid: (key: string, value: boolean) => void;
    setErrors: (key: string, value: ValidationRuleResult | null) => void;
    mergeForm: (formValue: FormState<FormSchema>) => void;
    setFieldProblems: (fieldProblems: FormStateFieldProblems) => void;
}

export type FormInitArg<FormSchema> = {
    schema: string[];
    defaultData: FormSchema;
    processField: ProcessFieldType;
    fieldProblems?: FormStateFieldProblems;
};

export type FormAction<FormSchema> = {
    type: string;
    key?: string;
    value?: unknown;
    mode?: ValidatorMode;
    schema?: string[];
    defaultData?: FormSchema;
    formValue?: FormState<FormSchema>;
    selectedSchema?: string[];
    fieldProblems?: FormStateFieldProblems;
    data?: FormSchema;
};

export type ProcessFieldType = (
    field: { key: string; value: unknown; mode: ValidatorMode },
    fieldContext: FieldContext
) => [unknown, ValidationResult];
