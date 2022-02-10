import { useCallback, useMemo, useReducer } from 'preact/hooks';
import Validator from '../Validator/Validator';
import { getReducer, init } from './reducer';
import { FormState, FormProps, DefaultDataState } from './types';

function useForm<DataState = DefaultDataState>(props: FormProps) {
    const { rules = {}, formatters = {}, defaultData = {} } = props;
    const validator = useMemo(() => new Validator(rules), [rules]);

    /** Formats and validates a field */
    const processField = ({ key, value, mode }, fieldContext) => {
        // Find a formatting function either stored under 'key' or a level deeper under a 'formatter' property
        const formatterFn = formatters?.[key]?.formatter ? formatters[key].formatter : formatters?.[key];
        const formattedValue = formatterFn && typeof formatterFn === 'function' ? formatterFn(value ?? '', fieldContext) : value;

        const validationResult = validator.validate({ key, value: formattedValue, mode }, fieldContext);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<DataState>, any, any>(
        getReducer(processField),
        { defaultData, schema: props.schema ?? [], processField },
        init
    );

    const isValid = useMemo(() => state.schema.every(key => state.valid[key]), [state.schema, state.valid]);

    const getTargetValue = (key, e) => {
        if (!e.target) return e;
        if (e.target.type === 'checkbox') return !state.data[key];
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
