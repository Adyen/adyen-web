import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';
import AchSecuredFields from './components/AchSecuredFields';
import SecuredFieldsProvider from '../../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import Field from '../../../internal/FormFields/Field';
import LoadingWrapper from '../../../internal/LoadingWrapper/LoadingWrapper';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import useCoreContext from '../../../../core/Context/useCoreContext';
import styles from './AchInput.module.scss';
import './AchInput.scss';
import { ACHInputDataState, ACHInputProps, ACHInputStateError, ACHInputStateValid } from './types';
import StoreDetails from '../../../internal/StoreDetails';
import { ComponentMethodsRef } from '../../../types';
import InputText from '../../../internal/FormFields/InputText';
import FormInstruction from '../../../internal/FormInstruction';
import RadioGroup from '../../../internal/FormFields/RadioGroup';

function validateHolderName(holderName, holderNameRequired = false) {
    if (holderNameRequired) {
        return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    }
    return true;
}

function AchInput(props: ACHInputProps) {
    const { i18n } = useCoreContext();

    const holderNameIsValid = props.hasHolderName && (!!props.holderName || !!props.data.holderName);

    const [errors, setErrors] = useState<ACHInputStateError>({});
    const [valid, setValid] = useState<ACHInputStateValid>({
        ...(props.holderNameRequired && { holderName: holderNameIsValid })
    });
    const [data, setData] = useState<ACHInputDataState>({
        bankAccountType: 'checking',
        ...(props.hasHolderName && { holderName: props.holderName || props.data.holderName })
    });

    const [isSfpValid, setIsSfpValid] = useState(false);
    const [focusedElement, setFocusedElement] = useState('');
    const [storePaymentMethod, setStorePaymentMethod] = useState(false);

    const handleFocus = e => {
        const isFocused = e.focus === true;

        setFocusedElement(e.currentFocusObject);

        if (isFocused) {
            props.onFocus(e);
        } else {
            props.onBlur(e);
        }
    };

    const handleHolderName = e => {
        const holderName = e.target.value;

        setData({ ...data, holderName });
        setErrors({ ...errors, holderName: props.holderNameRequired ? !validateHolderName(holderName) : false });
        setValid({ ...valid, holderName: props.holderNameRequired ? validateHolderName(holderName, props.holderNameRequired) : true });
    };

    const handleBankAccountType = e => {
        const bankAccountType = e.target.value;
        setData({ ...data, bankAccountType });
    };

    const handleSecuredFieldsChange = newState => {
        const sfState = newState;

        const tempHolderName = sfState.autoCompleteName ? sfState.autoCompleteName : data.holderName;

        setData({ ...data, ...sfState.data, holderName: tempHolderName });
        setErrors({ ...errors, ...sfState.errors });
        setValid({
            ...valid,
            ...sfState.valid,
            holderName: props.holderNameRequired ? validateHolderName(tempHolderName, props.holderNameRequired) : true
        });

        setIsSfpValid(sfState.isSfpValid);
    };

    // Refs
    const sfp = useRef(null);

    const [status, setStatus] = useState('ready');

    /** An object by which to expose 'public' members to the parent UIElement */
    const achRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(achRef.current).length) {
        props.setComponentRef?.(achRef.current);
    }

    achRef.current.showValidation = () => {
        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName
        if (props.holderNameRequired && !valid.holderName) {
            setErrors({ ...errors, holderName: true });
        }
    };

    achRef.current.setStatus = setStatus;

    useEffect(() => {
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;

        return () => {
            sfp.current.destroy();
        };
    }, []);

    // Run when state.data, -errors or -valid change
    useEffect(() => {
        // Validate whole component i.e holderName + securedFields
        const holderNameValid = validateHolderName(data.holderName, props.holderNameRequired);
        const sfpValid = isSfpValid;

        const isValid = sfpValid && holderNameValid;

        props.onChange({ data, isValid, storePaymentMethod });
    }, [data, valid, errors, storePaymentMethod]);

    return (
        <div className="adyen-checkout__ach">
            {props.showFormInstruction && <FormInstruction />}
            <SecuredFieldsProvider
                ref={sfp}
                {...extractPropsForSFP(props)}
                styles={{ ...defaultStyles, ...props.styles }}
                onChange={handleSecuredFieldsChange}
                onFocus={handleFocus}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div ref={setRootNode} className={`adyen-checkout__ach-input ${styles['sf-input__wrapper']}`}>
                        <LoadingWrapper status={sfpState.status}>
                            <div className={classNames(['adyen-checkout__fieldset', 'adyen-checkout__fieldset--ach'])}>
                                {<div className="adyen-checkout__fieldset__title">{i18n.get('ach.bankAccount')}</div>}

                                <Field classNameModifiers={['bankAccountType']} name={'bankAccountType'} useLabelElement={false}>
                                    <RadioGroup
                                        name={'bankAccountType'}
                                        value={data.bankAccountType}
                                        items={[
                                            { id: 'checking', name: 'ach.checking' },
                                            { id: 'savings', name: 'ach.savings' }
                                        ]}
                                        onChange={handleBankAccountType}
                                        required={true}
                                    />
                                </Field>

                                {props.hasHolderName && (
                                    <Field
                                        label={i18n.get('ach.accountHolderNameField.title')}
                                        className={'adyen-checkout__pm__holderName'}
                                        errorMessage={!!errors.holderName && i18n.get('ach.accountHolderNameField.invalid')}
                                        isValid={!!valid.holderName}
                                        name={'holderName'}
                                    >
                                        <InputText
                                            className={`adyen-checkout__pm__holderName__input ${styles['adyen-checkout__input']}`}
                                            placeholder={props.placeholders.holderName || i18n.get('ach.accountHolderNameField.placeholder')}
                                            value={data.holderName}
                                            required={props.holderNameRequired}
                                            onInput={handleHolderName}
                                        />
                                    </Field>
                                )}

                                <AchSecuredFields
                                    focusedElement={focusedElement}
                                    onFocusField={setFocusOn}
                                    errors={sfpState.errors}
                                    valid={sfpState.valid}
                                />
                            </div>

                            {props.enableStoreDetails && <StoreDetails onChange={setStorePaymentMethod} />}
                        </LoadingWrapper>
                    </div>
                )}
            />
            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

AchInput.defaultProps = defaultProps;

export default AchInput;

const extractPropsForSFP = (props: ACHInputProps) => {
    return {
        allowedDOMAccess: props.allowedDOMAccess,
        autoFocus: props.autoFocus,
        clientKey: props.clientKey,
        i18n: props.i18n,
        keypadFix: props.keypadFix,
        legacyInputMode: props.legacyInputMode,
        loadingContext: props.loadingContext,
        onAllValid: props.onAllValid,
        onConfigSuccess: props.onConfigSuccess,
        onError: props.onError,
        onFieldValid: props.onFieldValid,
        onFocus: props.onFocus,
        onLoad: props.onLoad,
        showWarnings: props.showWarnings,
        styles: props.styles,
        type: props.type,
        forceCompat: props.forceCompat,
        resources: props.resources
    };
};
