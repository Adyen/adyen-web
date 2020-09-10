import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';
import './IssuerList.scss';

const payButtonLabel = ({ issuer, items }, i18n) => {
    if (!issuer) return i18n.get('continue');

    const issuerName = items.find(i => i.id === issuer).name;
    return `${i18n.get('continueTo')} ${issuerName}`;
};

function IssuerList({ items, placeholder, issuer = null, ...props }) {
    const { i18n } = useCoreContext();
    const [selectedIssuer, setSelectedIssuer] = useState(issuer);
    const [errors, setErrors] = useState(false);
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const onSelectIssuer = e => {
        const newIssuer = e.currentTarget.getAttribute('data-value');
        setSelectedIssuer(newIssuer);
        setErrors(false);
    };

    useEffect(() => {
        props.onChange({ issuer: selectedIssuer });
    }, [selectedIssuer]);

    this.showValidation = () => {
        setErrors(!selectedIssuer);
    };

    return (
        <div className="adyen-checkout__issuer-list">
            <Field errorMessage={errors} classNameModifiers={['issuer-list']}>
                {renderFormField('select', {
                    items,
                    selected: selectedIssuer,
                    placeholder: i18n.get(placeholder),
                    name: 'issuer',
                    className: 'adyen-checkout__issuer-list__dropdown',
                    onChange: onSelectIssuer
                })}
            </Field>

            {props.showPayButton && props.payButton({ status, label: payButtonLabel({ issuer: selectedIssuer, items }, i18n) })}
        </div>
    );
}

IssuerList.defaultProps = {
    onChange: () => {},
    placeholder: 'idealIssuer.selectField.placeholder'
};

export default IssuerList;
