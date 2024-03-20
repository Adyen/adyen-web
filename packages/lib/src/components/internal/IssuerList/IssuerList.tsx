import { Fragment, h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import useForm from '../../../utils/useForm';
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
import Select from '../FormFields/Select';
import { SelectTargetObject } from '../FormFields/Select/types';
import {
    ANALYTICS_DISPLAYED_STR,
    ANALYTICS_FEATURED_ISSUER,
    ANALYTICS_INPUT_STR,
    ANALYTICS_LIST,
    ANALYTICS_LIST_SEARCH,
    ANALYTICS_SEARCH_DEBOUNCE_TIME,
    ANALYTICS_SELECTED_STR
} from '../../../core/Analytics/constants';
import { debounce } from '../../../utils/debounce';
import { Status } from '../BaseElement/types';

const payButtonLabel = ({ issuer, items }, i18n): string => {
    const issuerName = items.find(i => i.id === issuer)?.name;
    if (!issuer || !issuerName) return i18n.get('continue');
    return `${i18n.get('continueTo')} ${issuerName}`;
};

const schema = ['issuer'];
const validationRules: ValidatorRules = {
    issuer: {
        validate: issuer => !!issuer && issuer.length > 0,
        errorMessage: 'issuerList.selectField.contextualText',
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
    const [status, setStatus] = useState(Status.Ready);
    const [inputType, setInputType] = useState<IssuerListInputTypes>(IssuerListInputTypes.Dropdown);

    const { setSRMessagesFromObjects, shouldMoveFocusSR } = useSRPanelContext();
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({});

    const getErrorMessage = error => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const handleInputChange = useCallback(
        (type: IssuerListInputTypes) => (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            const target = type === IssuerListInputTypes.Dropdown ? ANALYTICS_LIST : ANALYTICS_FEATURED_ISSUER;
            const issuerObj = items.find(issuer => issuer.id === (event.target as SelectTargetObject).value);
            props.onSubmitAnalytics({ type: ANALYTICS_SELECTED_STR, target, issuer: issuerObj.name });

            setInputType(type);
            handleChangeFor('issuer')(event);
        },
        [handleChangeFor]
    );

    const handleListToggle = useCallback((isOpen: boolean) => {
        if (isOpen) {
            props.onSubmitAnalytics({ type: ANALYTICS_DISPLAYED_STR, target: ANALYTICS_LIST });
        }
    }, []);

    const debounceSearchAnalytics = useRef(debounce(props.onSubmitAnalytics, ANALYTICS_SEARCH_DEBOUNCE_TIME));

    const handleSearch = useCallback(() => {
        debounceSearchAnalytics.current({ type: ANALYTICS_INPUT_STR, target: ANALYTICS_LIST_SEARCH });
    }, []);

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
                label={i18n.get('issuerList.selectField.label')}
                errorMessage={getErrorMessage(errors.issuer)}
                classNameModifiers={['issuer-list']}
                name={'issuer'}
                showContextualElement={showContextualElement}
                contextualText={contextualText}
            >
                <Select
                    items={items}
                    selectedValue={inputType === IssuerListInputTypes.Dropdown ? data['issuer'] : null}
                    placeholder={placeholder}
                    name={'issuer'}
                    className={'adyen-checkout__issuer-list__dropdown'}
                    onChange={handleInputChange(IssuerListInputTypes.Dropdown)}
                    onListToggle={handleListToggle}
                    onInput={handleSearch}
                />
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
