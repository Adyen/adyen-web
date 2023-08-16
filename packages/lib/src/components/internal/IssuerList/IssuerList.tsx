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
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../core/Errors/SRPanelProvider';
import { SetSRMessagesReturnObject } from '../../../core/Errors/types';
import { ERROR_ACTION_FOCUS_FIELD } from '../../../core/Errors/constants';
import { setFocusOnField } from '../../../utils/setFocus';
import DisclaimerMessage from '../DisclaimerMessage';

const payButtonLabel = ({ issuer, items }, i18n): string => {
    const issuerName = items.find(i => i.id === issuer)?.name;
    if (!issuer || !issuerName) return i18n.get('continue');
    return `${i18n.get('continueTo')} ${issuerName}`;
};

const schema = ['issuer'];
const validationRules: ValidatorRules = {
    issuer: {
        validate: issuer => !!issuer && issuer.length > 0,
        errorMessage: 'idealIssuer.selectField.placeholder',
        modes: ['blur']
    }
};

enum IssuerListInputTypes {
    ButtonGroup,
    Dropdown
}

function IssuerList({ items, placeholder, issuer, highlightedIds = [], showContextualElement, contextualText, ...props }: IssuerListProps) {
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm({
        schema,
        defaultData: { issuer },
        rules: validationRules
    });
    const [status, setStatus] = useState('ready');
    const [inputType, setInputType] = useState<IssuerListInputTypes>(IssuerListInputTypes.Dropdown);

    const { setSRMessagesFromObjects, shouldMoveFocusSR } = useSRPanelContext();
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({});

    const getErrorMessage = error => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

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

        const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({ errors, isValidating: true });
        if (srPanelResp?.action === ERROR_ACTION_FOCUS_FIELD) {
            // Focus field in error, if required
            if (shouldMoveFocusSR) setFocusOnField('.adyen-checkout__issuer-list', srPanelResp.fieldToFocus);
        }
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

            <Field
                errorMessage={getErrorMessage(errors.issuer)}
                classNameModifiers={['issuer-list']}
                name={'issuer'}
                showContextualElement={showContextualElement}
                contextualText={contextualText}
            >
                {renderFormField('select', {
                    items,
                    selected: inputType === IssuerListInputTypes.Dropdown ? data['issuer'] : null,
                    placeholder,
                    name: 'issuer',
                    className: 'adyen-checkout__issuer-list__dropdown',
                    onChange: handleInputChange(IssuerListInputTypes.Dropdown)
                })}
            </Field>

            {props.termsAndConditions && (
                <div className="adyen-checkout__issuer-list__termsAndConditions">
                    <DisclaimerMessage message={i18n.get(props.termsAndConditions.translationKey)} urls={props.termsAndConditions.urls} />
                </div>
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    label: payButtonLabel({ issuer: data['issuer'], items: [...items, ...highlightedItems] }, i18n)
                })}
        </div>
    );
}

IssuerList.defaultProps = {
    onChange: () => {}
};

export default IssuerList;
