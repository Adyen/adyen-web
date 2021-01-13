import { useEffect, useMemo, useState } from 'preact/hooks';
import Validator from './Validator';

function useForm<DataState = { [key: string]: any }>({ rules = {}, formatters = {}, defaultData = {}, ...props }) {
    const validator = new Validator(rules);
    const [schema, setSchema] = useState<string[]>(props.schema ?? []);
    const [errors, setErrors] = useState<any>({});
    const [valid, setValid] = useState<any>({});
    const [data, setData] = useState<DataState>({} as DataState);
    const isValid = useMemo(() => schema.reduce((acc, val) => acc && valid[val], true), [valid]);

    const updateFieldData = (key, value, isFieldValid, mode?) => {
        setData(prevData => ({ ...prevData, [key]: value }));
        setValid(prevValid => ({ ...prevValid, [key]: isFieldValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: mode === 'blur' && !isFieldValid }));
    };

    /**
     * Format and validate a field
     */
    const processField = (key, value, mode) => {
        const formattedValue = formatters[key] ? formatters[key](value) : value;
        const isFieldValid = validator.validate(key, mode)(formattedValue);
        return [formattedValue, isFieldValid];
    };

    const reindexSchema = keys => {
        const cleanupRemovedFields = (prevData, initialValue) =>
            keys.reduce((acc, key) => {
                acc[key] = prevData[key] !== undefined ? prevData[key] : initialValue;
                return acc;
            }, {});

        setData(prevData => cleanupRemovedFields(prevData, null));
        setErrors(prevData => cleanupRemovedFields(prevData, null));
        setValid(prevData => cleanupRemovedFields(prevData, false));
    };

    const handleChangeFor = (key, mode = 'blur') => e => {
        const value = e.target ? e.target.value : e;
        const [formattedValue, isFieldValid] = processField(key, value, mode);

        updateFieldData(key, formattedValue, isFieldValid, mode);
    };

    const triggerValidation = () => {
        schema.forEach(key => {
            const [, isFieldValid] = processField(key, data[key], 'blur');
            setValid(prevState => ({ ...prevState, [key]: isFieldValid }));
            setErrors(prevState => ({ ...prevState, [key]: !isFieldValid }));
        });
    };

    // Rebuild from schema
    useEffect(() => {
        reindexSchema(schema);
    }, [schema]);

    // Set default values
    useEffect(() => {
        schema.forEach(fieldKey => {
            if (!!defaultData[fieldKey] && data[fieldKey] === null) {
                handleChangeFor(fieldKey)(defaultData[fieldKey]);
            }
        });
    }, [schema, data]);

    return {
        handleChangeFor,
        triggerValidation,
        setSchema,
        setData,
        setValid,
        setErrors,
        isValid,
        errors,
        valid,
        schema,
        data
    };
}

export default useForm;
