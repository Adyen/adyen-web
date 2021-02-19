import { useCallback, useMemo, useReducer } from 'preact/hooks';
import Validator, { ValidatorRules } from '../Validator/Validator';
import { reducer, init } from './reducer';
import { FormState, DefaultDataState } from './types';

function useForm<DataState = DefaultDataState>(props: { rules?: ValidatorRules; [key: string]: any }) {
    const { rules = {}, formatters = {}, defaultData = {} } = props;
    const validator = useMemo(() => new Validator(rules), []);

    /**
     * Format and validate a field
     */
    const processField = (key, value, mode) => {
        const formattedValue = formatters[key] ? formatters[key](value ?? '') : value;
        const validationResult = validator.validate(key, formattedValue, mode);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<DataState>, any, any>(reducer, { defaultData, schema: props.schema ?? [], processField }, init);
    const isValid = useMemo(() => state.schema.reduce((acc, val) => acc && state.valid[val], true), [state.schema, state.valid]);

    const updateFieldValidation = (key, validation) => {
        dispatch({ type: 'setValid', key, value: validation.isValid ?? false });
        dispatch({ type: 'setErrors', key, value: validation.hasError() ? validation.getError() : null });
    };

    const getTargetValue = (key, e) => {
        if (!e.target) return e;

        if (e.target.type === 'checkbox') {
            return !state.data[key];
        }
        return e.target.value;
    };

    const handleChangeFor = (key, mode = 'blur') => e => {
        const value = getTargetValue(key, e);
        const [formattedValue, validationResult] = processField(key, value, mode);

        dispatch({ type: 'setData', key, value: formattedValue });
        updateFieldValidation(key, validationResult);
    };

    const triggerValidation = useCallback(() => {
        dispatch({ type: 'validateForm', processField });
    }, []);

    const setErrors = useCallback((key, value) => dispatch({ type: 'setErrors', key, value }), []);
    const setValid = useCallback((key, value) => dispatch({ type: 'setValid', key, value }), []);
    const setData = useCallback((key, value) => dispatch({ type: 'setData', key, value }), []);
    const setSchema = useCallback(schema => dispatch({ type: 'setSchema', schema, processField, defaultData }), [state.schema]);

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
