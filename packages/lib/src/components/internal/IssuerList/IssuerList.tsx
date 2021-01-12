import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';
import './IssuerList.scss';

const payButtonLabel = ({ issuer, items }, i18n) => {
    const issuerName = items.find(i => i.id === issuer)?.name;
    if (!issuer || !issuerName) return i18n.get('continue');
    return `${i18n.get('continueTo')} ${issuerName}`;
};

const schema = ['issuer'];
const validationRules = {
    blur: {
        issuer: issuer => !!issuer && issuer.length > 0
    }
};

function IssuerList({ items, placeholder, issuer = null, ...props }) {
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm({
        schema,
        defaultData: { issuer },
        rules: validationRules
    });
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
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
