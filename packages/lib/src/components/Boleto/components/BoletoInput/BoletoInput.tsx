import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import Address from '../../../internal/Address';
import { boletoValidationRules } from './validate';
import { boletoFormatters } from './utils';
import SendCopyToEmail from '../../../internal/SendCopyToEmail/SendCopyToEmail';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { BoletoInputDataState } from '../../types';
import useForm from '../../../../utils/useForm';
import { BrazilPersonalDetail } from '../../../internal/SocialSecurityNumberBrazil/BrazilPersonalDetail';

function BoletoInput(props) {
    const { i18n } = useCoreContext();
    const addressRef = useRef(null);
    const { handleChangeFor, triggerValidation, setSchema, setData, setValid, setErrors, data, valid, errors, isValid } = useForm<
        BoletoInputDataState
    >({
        schema: ['firstName', 'lastName', 'socialSecurityNumber', 'billingAddress', 'shopperEmail'],
        defaultData: props.data,
        rules: boletoValidationRules,
        formatters: boletoFormatters
    });

    // Email field toggle
    const [showingEmail, setShowingEmail] = useState<boolean>(false);
    const toggleEmailField = () => setShowingEmail(!showingEmail);

    // Handle form schema updates
    useEffect(() => {
        const newSchema = [
            ...(props.personalDetailsRequired ? ['firstName', 'lastName', 'socialSecurityNumber'] : []),
            ...(props.billingAddressRequired ? ['billingAddress'] : []),
            ...(showingEmail ? ['shopperEmail'] : [])
        ];
        setSchema(newSchema);
    }, [showingEmail, props.personalDetailsRequired, props.billingAddressRequired]);

    const handleAddress = address => {
        setData('billingAddress', address.data);
        setValid('billingAddress', address.isValid);
        setErrors('billingAddress', address.errors);
    };

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        triggerValidation();
        if (props.billingAddressRequired) {
            addressRef.current.showValidation();
        }
    };

    useEffect(() => {
        const billingAddressValid = props.billingAddressRequired ? Boolean(valid.billingAddress) : true;
        props.onChange({ data, valid, errors, isValid: isValid && billingAddressValid });
    }, [data, valid, errors]);

    const buttonModifiers = [...(!props.personalDetailsRequired && !props.billingAddressRequired && !props.showEmailAddress ? ['standalone'] : [])];

    return (
        <div className="adyen-checkout__boleto-input__field">
            {props.personalDetailsRequired && (
                <BrazilPersonalDetail i18n={i18n} data={data} handleChangeFor={handleChangeFor} errors={errors} valid={valid} />
            )}

            {props.billingAddressRequired && (
                <Address
                    allowedCountries={['BR']}
                    label="billingAddress"
                    data={{ ...props.data.billingAddress, country: 'BR' }}
                    onChange={handleAddress}
                    requiredFields={['country', 'street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince']}
                    ref={addressRef}
                />
            )}

            {props.showEmailAddress && (
                <SendCopyToEmail
                    value={data.shopperEmail}
                    errors={errors.shopperEmail}
                    onToggle={toggleEmailField}
                    onInput={handleChangeFor('shopperEmail', 'input')}
                    onChange={handleChangeFor('shopperEmail')}
                />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    label: i18n.get('boletobancario.btnLabel'),
                    classNameModifiers: buttonModifiers
                })}
        </div>
    );
}

BoletoInput.defaultProps = {
    data: {},
    showEmailAddress: true,
    personalDetailsRequired: true,
    billingAddressRequired: true
};

export default BoletoInput;
