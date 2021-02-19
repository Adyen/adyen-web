import { useCallback, useMemo, useReducer } from 'preact/hooks';
import Validator, { ValidatorRules } from '../Validator/Validator';
import { getReducer, init } from './reducer';
import { FormState, DefaultDataState } from './types';

function useForm<DataState = DefaultDataState>(props: { rules?: ValidatorRules; [key: string]: any }) {
    const { rules = {}, formatters = {}, defaultData = {} } = props;
    const validator = useMemo(() => new Validator(rules), []);

    /** Formats and validates a field */
    const processField = (key, value, mode) => {
        const formattedValue = formatters[key] ? formatters[key](value ?? '') : value;
        const validationResult = validator.validate(key, formattedValue, mode);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<DataState>, any, any>(
        getReducer(processField),
        { defaultData, schema: props.schema ?? [], processField },
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
    const handleChangeFor = (key, mode = 'blur') => e => {
        const value = getTargetValue(key, e);
        dispatch({ type: 'updateField', key, value, mode });
    };

    /** Validates every field in the form */
    const triggerValidation = useCallback(() => {
        dispatch({ type: 'validateForm' });
    }, []);

    const setErrors = useCallback((key, value) => dispatch({ type: 'setErrors', key, value }), []);
    const setValid = useCallback((key, value) => dispatch({ type: 'setValid', key, value }), []);
    const setData = useCallback((key, value) => dispatch({ type: 'setData', key, value }), []);
    const setSchema = useCallback(schema => dispatch({ type: 'setSchema', schema, defaultData }), [state.schema]);

    return {
        handleChangeFor,
        triggerValidation,
        setSchema,
        setData,
        setValid,
        setErrors,
        isValid,
        schema: state.schema,
        valid: state.valid,
        errors: state.errors,
        data: state.data
    };
}

export default useForm;
