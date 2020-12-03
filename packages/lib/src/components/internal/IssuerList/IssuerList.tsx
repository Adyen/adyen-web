import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';
import './IssuerList.scss';
import Validator from '../../../utils/Validator';

const payButtonLabel = ({ issuer, items }, i18n) => {
    const issuerName = items.find(i => i.id === issuer)?.name;
    if (!issuer || !issuerName) return i18n.get('continue');
    return `${i18n.get('continueTo')} ${issuerName}`;
};

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

    const updateFieldData = (key, value, isValid) => {
        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isValid });
        setErrors({ ...errors, [key]: !isValid });
    };

    const handleChangeFor = (key, mode = 'blur') => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, mode)(value);
        updateFieldData(key, value, isValid);
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

function IssuerList({ items, placeholder, issuer = null, ...props }) {
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm({
        schema: ['issuer'],
        rules: {
            blur: {
                issuer: issuer => !!issuer && issuer.length > 0
            }
        }
    });
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
        console.log('CHANGES', data, valid, errors, isValid);
    }, [data, valid, errors, isValid]);

    this.showValidation = () => {
        triggerValidation();
    };

    return (
        <div className="adyen-checkout__issuer-list">
            <Field errorMessage={errors['issuer']} classNameModifiers={['issuer-list']}>
                {renderFormField('select', {
                    items,
                    selected: data['issuer'],
                    placeholder: i18n.get(placeholder),
                    name: 'issuer',
                    className: 'adyen-checkout__issuer-list__dropdown',
                    onChange: handleChangeFor('issuer')
                })}
            </Field>

            {props.showPayButton && props.payButton({ status, label: payButtonLabel({ issuer: data['issuer'], items }, i18n) })}
        </div>
    );
}

IssuerList.defaultProps = {
    onChange: () => {},
    placeholder: 'idealIssuer.selectField.placeholder'
};

export default IssuerList;
