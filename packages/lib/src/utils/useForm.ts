import { useEffect, useMemo, useState } from 'preact/hooks';
import Validator, { ValidatorRules } from './Validator/FormValidator';

function useForm<DataState = { [key: string]: any }>({
    rules,
    formatters = {},
    defaultData = {},
    ...props
}: {
    rules?: ValidatorRules;
    [key: string]: any;
}) {
    const validator = new Validator(rules);
    const [schema, setSchema] = useState<string[]>(props.schema ?? []);
    const [errors, setErrors] = useState<any>({});
    const [valid, setValid] = useState<any>({});
    const [data, setData] = useState<DataState>({} as DataState);
    const isValid = useMemo(() => schema.reduce((acc, val) => acc && valid[val], true), [valid]);

    const updateFieldData = (key, value) => {
        setData(prevData => ({ ...prevData, [key]: value }));
    };

    const updateFieldValidation = (key, validation) => {
        setValid(prevValid => ({ ...prevValid, [key]: validation.isValid ?? false }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: validation.hasError() ? validation.getError() : false }));
    };

    /**
     * Format and validate a field
     */
    const processField = (key, value, mode) => {
        const formattedValue = formatters[key] ? formatters[key](value) : value;
        const validationResult = validator.validate(key, formattedValue, mode);
        return [formattedValue, validationResult];
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
        const [formattedValue, validationResult] = processField(key, value, mode);

        updateFieldData(key, formattedValue);
        updateFieldValidation(key, validationResult);
    };

    const triggerValidation = () => {
        schema.forEach(key => {
            const [, validationResult] = processField(key, data[key], 'blur');
            updateFieldValidation(key, validationResult);
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
