import { useCallback, useEffect, useMemo, useReducer } from 'preact/hooks';
import Validator from '../Validator';
import { getReducer, init } from './reducer';
import { Form, FormState, FormProps, Formatter } from './types';

function isFormatterObject(formatter: Formatter | Function): formatter is Formatter {
    return formatter && ('formatterFn' in formatter);
}

function useForm<FormSchema>(props: FormProps): Form<FormSchema> {
    const { rules = {}, formatters = {}, defaultData = {}, fieldProblems = {}, schema = [] } = props;

    const validator = useMemo(() => new Validator(rules), [rules]);

    /** Formats and validates a field */
    const processField = ({ key, value, mode }, fieldContext) => {
        // Find a formatting function either stored under 'key' or a level deeper under a 'formatter' property
        const formatter = formatters?.[key];
        const formatterFn = isFormatterObject(formatter) ? formatter.formatterFn : formatter;
        const formattedValue = formatterFn && typeof formatterFn === 'function' ? formatterFn(value ?? '', fieldContext) : value;

        const validationResult = validator.validate({ key, value: formattedValue, mode }, fieldContext);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<FormSchema>, any, any>(
        getReducer(processField),
        { defaultData, schema: schema ?? [], processField, fieldProblems },
        init
    );
    const isValid = useMemo(() => state.schema.reduce((acc, val) => acc && state.valid[val], true), [state.schema, state.valid]);

    const getTargetValue = (key, e) => {
        if (!e.target) return e;

        if (e.target.type === 'checkbox') {
            return !state.data[key];
        }
        return e.target.value;
    };

    /** Formats, validates, and stores a new value for a form field */
    const handleChangeFor = (key, mode) => {
        return e => {
            const value = getTargetValue(key, e);
            dispatch({ type: 'updateField', key, value, mode });
        };
    };

    /** Validates every field in the form OR just those in selectedSchema */
    const triggerValidation = useCallback((selectedSchema = null) => {
        dispatch({ type: 'validateForm', selectedSchema });
    }, []);

    const setErrors = useCallback((key, value) => dispatch({ type: 'setErrors', key, value }), []);
    const setValid = useCallback((key, value) => dispatch({ type: 'setValid', key, value }), []);
    const setData = useCallback((key, value) => dispatch({ type: 'setData', key, value }), []);
    const setSchema = useCallback(schema => dispatch({ type: 'setSchema', schema, defaultData }), [state.schema]);
    const mergeForm = useCallback(formValue => dispatch({ type: 'mergeForm', formValue }), []);
    const setFieldProblems = useCallback(fieldProblems => dispatch({ type: 'setFieldProblems', fieldProblems }), [state.schema]);

    // Set reducer fields problems if fieldProblems prop changes
    useEffect(() => {
        setFieldProblems(fieldProblems ?? {});
    }, [JSON.stringify(fieldProblems)]);

    return {
        handleChangeFor,
        triggerValidation,
        setSchema,
        setData,
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
