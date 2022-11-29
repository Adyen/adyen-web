import { Fragment, h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import { renderFormField } from '../FormFields';
import Field from '../FormFields/Field';
import IssuerButtonGroup from './IssuerButtonGroup';
import ContentSeparator from '../ContentSeparator';
import useCoreContext from '../../../core/Context/useCoreContext';
import { ValidatorRules } from '../../../utils/Validator/types';
import { IssuerListProps } from './types';
import './IssuerList.scss';
import { interpolateElement } from '../../../language/utils';

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

enum IssuerListInputTypes {
    ButtonGroup,
    Dropdown
}

function IssuerList({ items, placeholder = 'idealIssuer.selectField.placeholder', issuer, highlightedIds = [], ...props }: IssuerListProps) {
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm({
        schema,
        defaultData: { issuer },
        rules: validationRules
    });
    const [status, setStatus] = useState('ready');
    const [inputType, setInputType] = useState<IssuerListInputTypes>(IssuerListInputTypes.Dropdown);

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const handleInputChange = useCallback(
        (type: IssuerListInputTypes) => (event: UIEvent) => {
            setInputType(type);
            handleChangeFor('issuer')(event);
        },
        [handleChangeFor]
    );

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.showValidation = () => {
        triggerValidation();
    };

    const { highlightedItems } = items.reduce(
        (memo, item) => {
            if (highlightedIds.includes(item.id)) memo.highlightedItems.push({ ...item });
            return memo;
        },
        { highlightedItems: [] }
    );

    return (
        <div className="adyen-checkout__issuer-list">
            {!!highlightedItems.length && (
                <Fragment>
                    <IssuerButtonGroup
                        selectedIssuerId={inputType === IssuerListInputTypes.ButtonGroup ? data['issuer'] : null}
                        items={highlightedItems}
                        onChange={handleInputChange(IssuerListInputTypes.ButtonGroup)}
                    />
                    <ContentSeparator />
                </Fragment>
            )}

            <Field errorMessage={!!errors['issuer']} classNameModifiers={['issuer-list']}>
                {renderFormField('select', {
                    items,
                    selected: inputType === IssuerListInputTypes.Dropdown ? data['issuer'] : null,
                    placeholder: i18n.get(placeholder),
                    name: 'issuer',
                    className: 'adyen-checkout__issuer-list__dropdown',
                    onChange: handleInputChange(IssuerListInputTypes.Dropdown)
                })}
            </Field>

            {props.showPayButton &&
                props.payButton({
                    status,
                    label: payButtonLabel({ issuer: data['issuer'], items: [...items, ...highlightedItems] }, i18n)
                })}

            {props.termsAndConditionsUrl && (
                <div className="adyen-checkout__issuer-list__termsAndConditions">
                    <p className="adyen-checkout__helper-text">
                        {interpolateElement(i18n.get('onlineBanking.termsAndConditions'), [
                            translation => (
                                <a href={props.termsAndConditionsUrl} target="_blank" rel="noopener noreferrer">
                                    {translation}
                                </a>
                            )
                        ])}
                    </p>
                </div>
            )}
        </div>
    );
}

IssuerList.defaultProps = {
    onChange: () => {}
};

export default IssuerList;
