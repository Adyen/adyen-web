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

    const updateFieldData = (key, value, isValid, mode) => {
        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isValid });
        setErrors({ ...errors, [key]: mode === 'blur' && !isValid });
    };

    const handleChangeFor = (key, mode = 'blur') => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, mode)(value);
        updateFieldData(key, value, isValid, mode);
    };

    const triggerValidation = () => {
        schema.forEach(key => {
            const isValid = validator.validate(key, 'blur')(data[key]);
            setValid({ ...valid, [key]: isValid });
            setErrors({ ...errors, [key]: !isValid });
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
