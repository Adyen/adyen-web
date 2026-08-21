import { useCallback, useEffect, useMemo, useReducer } from 'preact/hooks';
import Validator from '../Validator';
import { getReducer, init } from './reducer';

import type { Reducer } from 'preact/hooks';
import type { Form, FormState, FormProps, Formatter, FormAction, FormInitArg, ProcessFieldType, FormChangeEventTarget } from './types';
import { useCoreContext } from '../../core/Context/CoreProvider';
import { ValidatorMode } from '../Validator/types';
import { ValidationRuleResult } from '../Validator/ValidationRuleResult';

function isFormatterObject(formatter: Formatter | Function): formatter is Formatter {
    return formatter && 'formatterFn' in formatter;
}

function hasEventTarget(event: unknown): event is { target: FormChangeEventTarget } {
    return !!event && typeof event === 'object' && 'target' in event;
}

function useForm<FormSchema extends object>(props: FormProps): Form<FormSchema> {
    // Normalize null values to empty objects/arrays to avoid type errors
    const {
        rules: providedRules,
        formatters: providedFormatters,
        defaultData: providedDefaultData,
        fieldProblems: providedFieldProblems,
        schema: providedSchema
    } = props;
    const rules = providedRules ?? {};
    const formatters = providedFormatters ?? {};
    const defaultData = (providedDefaultData ?? {}) as FormSchema;
    const fieldProblems = (providedFieldProblems ?? {}) as Record<string, string | null>;
    const schema = providedSchema ?? [];

    const { i18n } = useCoreContext();

    const validator = useMemo(() => new Validator(rules, i18n), [rules]);

    /** Formats and validates a field */
    const processField: ProcessFieldType = ({ key, value, mode }, fieldContext) => {
        // Find a formatting function either stored under 'key' or a level deeper under a 'formatter' property
        const formatter = formatters?.[key];
        const formatterFn = isFormatterObject(formatter) ? formatter.formatterFn : formatter;
        const formattedValue = formatterFn && typeof formatterFn === 'function' ? formatterFn(value ?? '', fieldContext) : value;

        const validationResult = validator.validate({ key, value: formattedValue, mode }, fieldContext);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<FormSchema>, FormAction<FormSchema>, FormInitArg<FormSchema>>(
        getReducer<FormSchema>(processField) as Reducer<FormState<FormSchema>, FormAction<FormSchema>>,
        { defaultData, schema, processField, fieldProblems },
        init as (arg: FormInitArg<FormSchema>) => FormState<FormSchema>
    );
    const isValid = useMemo(() => state.schema.reduce((acc, val) => acc && state.valid[val], true), [state.schema, state.valid]);

    const getTargetValue = (key: string, e: unknown) => {
        if (!hasEventTarget(e)) return e;

        if (e.target?.type === 'checkbox') {
            return !(state.data as Record<string, unknown>)[key];
        }
        return e.target?.value;
    };

    /** Formats, validates, and stores a new value for a form field */
    const handleChangeFor = (key: string, mode: ValidatorMode) => {
        return (e: unknown) => {
            const value = getTargetValue(key, e);
            dispatch({ type: 'updateField', key, value, mode });
        };
    };

    /** Validates every field in the form OR just those in selectedSchema */
    const triggerValidation = useCallback((selectedSchema?: string[]) => {
        dispatch({ type: 'validateForm', selectedSchema });
    }, []);

    const setErrors = useCallback((key: string, value: ValidationRuleResult | null) => dispatch({ type: 'setErrors', key, value }), []);
    const setValid = useCallback((key: string, value: boolean) => dispatch({ type: 'setValid', key, value }), []);
    const setData = useCallback((key: string, value: unknown) => dispatch({ type: 'setData', key, value }), []);
    const mergeData = useCallback((data: FormSchema) => dispatch({ type: 'mergeData', data }), []);
    const setSchema = useCallback((schema: string[]) => dispatch({ type: 'setSchema', schema, defaultData }), [state.schema]);
    const mergeForm = useCallback((formValue: FormState<FormSchema>) => dispatch({ type: 'mergeForm', formValue }), []);
    const setFieldProblems = useCallback(
        (fieldProblems: Record<string, string | null>) => dispatch({ type: 'setFieldProblems', fieldProblems }),
        [state.schema]
    );

    // Set reducer fields problems if fieldProblems prop changes
    useEffect(() => {
        setFieldProblems(fieldProblems ?? {});
    }, [JSON.stringify(fieldProblems)]);

    return {
        handleChangeFor,
        triggerValidation,
        setSchema,
        setData,
        mergeData,
        setValid,
        setErrors,
        isValid,
        mergeForm,
        setFieldProblems,
        schema: state.schema,
        valid: state.valid,
        errors: state.errors,
        data: state.data,
        fieldProblems: state.fieldProblems
    };
}

export default useForm;
