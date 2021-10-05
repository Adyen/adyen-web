import { Fragment, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import IssuerButtonGroup from './IssuerButtonGroup';
import ContentSeparator from './ContentSeparator';
import useCoreContext from '../../../core/Context/useCoreContext';
import './IssuerList.scss';
import { ValidatorRules } from '../../../utils/Validator/Validator';
import { IssuerListProps } from './types';

const payButtonLabel = ({ issuer, items }, i18n): string => {
    const issuerName = items.find(i => i.id === issuer)?.name;
    if (!issuer || !issuerName) return i18n.get('continue');
    return `${i18n.get('continueTo')} ${issuerName}`;
};

const schema = ['issuer'];
const validationRules: ValidatorRules = {
    issuer: {
        validate: issuer => !!issuer && issuer.length > 0,
        modes: ['blur']
    }
};

const selectorPlaceholder = (placeholder: string, hasPredefinedIssuers: boolean): string => {
    if (placeholder) return placeholder;
    if (hasPredefinedIssuers) return 'idealIssuer.selectField.placeholderWithPredefinedIssuers';
    return 'idealIssuer.selectField.placeholder';
};

function IssuerList({ items, placeholder, issuer, predefinedIssuers = [], ...props }: IssuerListProps) {
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
            {!!predefinedIssuers.length && (
                <Fragment>
                    <IssuerButtonGroup selectedIssuerId={data['issuer']} options={predefinedIssuers} onChange={handleChangeFor('issuer')} />
                    <ContentSeparator />
                </Fragment>
            )}

            <Field errorMessage={!!errors['issuer']} classNameModifiers={['issuer-list']}>
                {renderFormField('select', {
                    items,
                    selected: data['issuer'],
                    placeholder: i18n.get(selectorPlaceholder(placeholder, !!predefinedIssuers.length)),
                    name: 'issuer',
                    className: 'adyen-checkout__issuer-list__dropdown',
                    onChange: handleChangeFor('issuer')
                })}
            </Field>

            {props.showPayButton &&
                props.payButton({
                    status,
                    label: payButtonLabel({ issuer: data['issuer'], items: [...items, ...predefinedIssuers] }, i18n)
                })}
        </div>
    );
}

IssuerList.defaultProps = {
    onChange: () => {}
};

export default IssuerList;
