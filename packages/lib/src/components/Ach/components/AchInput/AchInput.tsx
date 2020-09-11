import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';
import AchSecuredFields from './components/AchSecuredFields';
import SecuredFieldsProvider from '../../../../components/internal/SecuredFields/SecuredFieldsProvider';
import Address from '../../../internal/Address';
import { renderFormField } from '../../../internal/FormFields';
import Field from '../../../internal/FormFields/Field';
import LoadingWrapper from '../../../internal/LoadingWrapper/LoadingWrapper';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import useCoreContext from '../../../../core/Context/useCoreContext';
import styles from './AchInput.module.scss';
import './AchInput.scss';
import { ACHInputStateError, ACHInputStateValid } from './types';

function validateHolderName(holderName, holderNameRequired = false) {
    if (holderNameRequired) {
        return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    }
    return true;
}

function AchInput(props) {
    const { i18n } = useCoreContext();

    const holderNameIsValid = props.hasHolderName && (props.holderName || props.data.holderName);

    const [errors, setErrors] = useState<ACHInputStateError>({});
    const [valid, setValid] = useState<ACHInputStateValid>({
        ...(props.holderNameRequired && { holderName: holderNameIsValid })
    });
    const [data, setData] = useState({
        ...(props.hasHolderName && { holderName: props.holderName || props.data.holderName })
    });

    const [billingAddress, setBillingAddress] = useState(props.billingAddressRequired ? props.data.billingAddress : null);
    const [isSfpValid, setIsSfpValid] = useState(false);
    const [focusedElement, setFocusedElement] = useState('');

    const handleFocus = e => {
        const isFocused = e.focus === true;

        setFocusedElement(e.currentFocusObject);

        if (isFocused) {
            props.onFocus(e);
        } else {
            props.onBlur(e);
        }
    };

    const handleAddress = address => {
        setBillingAddress({ ...billingAddress, ...address.data });
        setValid({ ...valid, billingAddress: address.isValid });
    };

    const handleHolderName = e => {
        const holderName = e.target.value;

        setData({ ...data, holderName });
        setErrors({ ...errors, holderName: props.holderNameRequired ? !validateHolderName(holderName) : false });
        setValid({ ...valid, holderName: props.holderNameRequired ? validateHolderName(holderName, props.holderNameRequired) : true });
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
    const billingAddressRef = useRef(null);

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = () => {
        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName
        if (props.holderNameRequired && !valid.holderName) {
            setErrors({ ...errors, holderName: true });
        }

        // Validate Address
        if (billingAddressRef.current) billingAddressRef.current.showValidation();
    };

    useEffect(() => {
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;

        return () => {
            sfp.current.destroy();
        };
    }, []);

    // Run when state.data, -errors or -valid change
    useEffect(() => {
        // Validate whole component i.e holderName + securedFields + address
        const holderNameValid = validateHolderName(data.holderName, props.holderNameRequired);
        const sfpValid = isSfpValid;
        const billingAddressValid = props.billingAddressRequired ? Boolean(valid.billingAddress) : true;

        const isValid = sfpValid && holderNameValid && billingAddressValid;

        props.onChange({ data, isValid, billingAddress });
    }, [data, valid, errors]);

    return (
        <div className="adyen-checkout__ach">
            <SecuredFieldsProvider
                ref={sfp}
                {...props}
                styles={{ ...defaultStyles, ...props.styles }}
                onChange={handleSecuredFieldsChange}
                onFocus={handleFocus}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div ref={setRootNode} className={`adyen-checkout__ach-input ${styles['sf-input__wrapper']}`}>
                        <LoadingWrapper status={sfpState.status}>
                            <div className={classNames(['adyen-checkout__fieldset', 'adyen-checkout__fieldset--ach'])}>
                                {<div className="adyen-checkout__fieldset__title">{i18n.get('ach.bankAccount')}</div>}

                                {props.hasHolderName && (
                                    <Field
                                        label={i18n.get('ach.accountHolderNameField.title')}
                                        className={'adyen-checkout__pm__holderName'}
                                        errorMessage={!!errors.holderName && i18n.get('ach.accountHolderNameField.invalid')}
                                        isValid={!!valid.holderName}
                                    >
                                        {renderFormField('text', {
                                            className: `adyen-checkout__pm__holderName__input ${styles['adyen-checkout__input']}`,
                                            placeholder: props.placeholders.holderName || i18n.get('ach.accountHolderNameField.placeholder'),
                                            value: data.holderName,
                                            required: props.holderNameRequired,
                                            onInput: handleHolderName
                                        })}
                                    </Field>
                                )}

                                <AchSecuredFields
                                    focusedElement={focusedElement}
                                    onFocusField={setFocusOn}
                                    errors={sfpState.errors}
                                    valid={sfpState.valid}
                                />
                            </div>

                            {props.billingAddressRequired && (
                                <Address
                                    label="billingAddress"
                                    data={billingAddress}
                                    onChange={handleAddress}
                                    allowedCountries={props.billingAddressAllowedCountries}
                                    requiredFields={props.billingAddressRequiredFields}
                                    ref={billingAddressRef}
                                />
                            )}
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
