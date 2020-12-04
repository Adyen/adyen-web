import { useMemo, useState } from 'preact/hooks';
import Validator from './Validator';

function useForm({ rules = {}, schema = [] }) {
    const validator = new Validator(rules);

    const [errors, setErrors] = useState(
        schema.reduce((accumulator, currentValue) => {
            accumulator[currentValue] = null;
            return accumulator;
        }, {})
    );

    const [valid, setValid] = useState(
        schema.reduce((accumulator, currentValue) => {
            accumulator[currentValue] = false;
            return accumulator;
        }, {})
    );

    const [data, setData] = useState(
        schema.reduce((accumulator, currentValue) => {
            accumulator[currentValue] = null;
            return accumulator;
        }, {})
    );

    const isValid = useMemo(() => schema.reduce((acc, val) => acc && valid[val], true), [valid]);

    const updateFieldData = (key, value, isFieldValid, mode) => {
        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isFieldValid });
        setErrors({ ...errors, [key]: mode === 'blur' && !isFieldValid });
    };

    const handleChangeFor = (key, mode = 'blur') => e => {
        const { value } = e.target;
        const isFieldValid = validator.validate(key, mode)(value);
        updateFieldData(key, value, isFieldValid, mode);
    };

    const triggerValidation = () => {
        schema.forEach(key => {
            const isFieldValid = validator.validate(key, 'blur')(data[key]);
            setValid({ ...valid, [key]: isFieldValid });
            setErrors({ ...errors, [key]: !isFieldValid });
        });
    };

    return {
        handleChangeFor,
        triggerValidation,
        isValid,
        errors,
        valid,
        data
    };
}

export default useForm;
