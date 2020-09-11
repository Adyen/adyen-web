import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { renderFormField } from '../../../internal/FormFields';
import Field from '../../../internal/FormFields/Field';
import Address from '../../../internal/Address';
import Validator from '../../../../utils/Validator';
import { boletoValidationRules } from './validate';
import SendCopyToEmail from './SendCopyToEmail';
import { formatCPFCNPJ } from './utils';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { BoletoInputDataState, BoletoInputErrorState, BoletoInputValidState } from '../../types';

const validator = new Validator(boletoValidationRules);

function BoletoInput(props) {
    const { i18n } = useCoreContext();
    const addressRef = useRef(null);

    const [data, setData] = useState<BoletoInputDataState>({
        ...props.data,
        ...(props.data.socialSecurityNumber && { socialSecurityNumber: formatCPFCNPJ(props.data.socialSecurityNumber) })
    });
    const [errors, setErrors] = useState<BoletoInputErrorState>({});
    const [valid, setValid] = useState<BoletoInputValidState>({
        ...(props.data.socialSecurityNumber && {
            socialSecurityNumber: validator.validate('socialSecurityNumber', 'input')(formatCPFCNPJ(this.props.data.socialSecurityNumber))
        })
    });

    const [showingEmail, setShowingEmail] = useState(false);
    const toggleEmailField = () => setShowingEmail(!showingEmail);

    const buttonModifiers = [...(!props.personalDetailsRequired && !props.billingAddressRequired && !props.showEmailAddress ? ['standalone'] : [])];

    const updateFieldData = (key, value, isValid) => {
        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isValid });
        setErrors({ ...errors, [key]: !isValid });
    };

    const handleInputFor = key => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, 'input')(value);

        updateFieldData(key, value, isValid);
    };

    const handleChangeFor = key => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, 'blur')(value);

        updateFieldData(key, value, isValid);
    };

    const handleCPFInput = e => {
        const key = 'socialSecurityNumber';
        const value = formatCPFCNPJ(e.target.value);
        const isValid = validator.validate(key, 'input')(value);

        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isValid });
        setErrors({ ...errors, [key]: false });
    };

    const handleAddress = address => {
        setData({ ...data, billingAddress: address.data });
        setValid({ ...valid, billingAddress: address.isValid });
    };

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = () => {
        setErrors({
            ...(showingEmail && { shopperEmail: !validator.validate('shopperEmail')(data.shopperEmail) }),
            ...(props.personalDetailsRequired && {
                firstName: !validator.validate('firstName')(data.firstName),
                lastName: !validator.validate('lastName')(data.lastName),
                socialSecurityNumber: !validator.validate('socialSecurityNumber')(data.socialSecurityNumber)
            })
        });

        if (props.billingAddressRequired) {
            addressRef.current.showValidation();
        }
    };

    useEffect(() => {
        const personalFields = ['firstName', 'lastName', 'socialSecurityNumber'];
        const personalFieldsValid = props.personalDetailsRequired
            ? personalFields.reduce((acc, field) => acc && Boolean(validator.validate(field, 'blur')(data[field])), true)
            : true;

        const billingAddressValid = props.billingAddressRequired ? Boolean(valid.billingAddress) : true;
        const emailRequired = showingEmail && props.showEmailAddress;
        const emailAddressValid = emailRequired ? Boolean(validator.validate('shopperEmail', 'blur')(data.shopperEmail)) : true;
        const shopperEmail = emailRequired ? data.shopperEmail : null;
        const isValid = personalFieldsValid && billingAddressValid && emailAddressValid;

        props.onChange({ data: { ...data, shopperEmail }, isValid });
    }, [data, valid, errors, showingEmail]);

    return (
        <div className="adyen-checkout__boleto-input__field">
            {props.personalDetailsRequired && (
                <div className={'adyen-checkout__fieldset adyen-checkout__fieldset--address adyen-checkout__fieldset--personalDetails'}>
                    <div className="adyen-checkout__fieldset__title">{i18n.get('personalDetails')}</div>

                    <div className="adyen-checkout__fieldset__fields">
                        <Field label={i18n.get('firstName')} classNameModifiers={['firstName', 'col-50']} errorMessage={errors.firstName}>
                            {renderFormField('text', {
                                name: 'firstName',
                                autocorrect: 'off',
                                spellcheck: false,
                                value: data.firstName,
                                onInput: handleInputFor('firstName'),
                                onChange: handleChangeFor('firstName')
                            })}
                        </Field>

                        <Field label={i18n.get('lastName')} classNameModifiers={['lastName', 'col-50']} errorMessage={errors.lastName}>
                            {renderFormField('text', {
                                name: 'lastName',
                                autocorrect: 'off',
                                spellcheck: false,
                                value: data.lastName,
                                onInput: handleInputFor('lastName'),
                                onChange: handleChangeFor('lastName')
                            })}
                        </Field>

                        <Field
                            label={`${i18n.get('boleto.socialSecurityNumber')}`}
                            classNameModifiers={['socialSecurityNumber']}
                            errorMessage={errors.socialSecurityNumber}
                            isValid={Boolean(valid.socialSecurityNumber)}
                        >
                            {renderFormField('text', {
                                name: 'socialSecurityNumber',
                                autocorrect: 'off',
                                spellcheck: false,
                                value: data.socialSecurityNumber,
                                onInput: handleCPFInput,
                                maxLength: 18,
                                onChange: handleChangeFor('socialSecurityNumber')
                            })}
                        </Field>
                    </div>
                </div>
            )}

            {props.billingAddressRequired && (
                <Address
                    label="billingAddress"
                    data={{ ...data.billingAddress, country: 'BR' }}
                    onChange={handleAddress}
                    requiredFields={['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince']}
                    ref={addressRef}
                />
            )}

            {props.showEmailAddress && (
                <SendCopyToEmail
                    value={data.shopperEmail}
                    errors={errors.shopperEmail}
                    onToggle={toggleEmailField}
                    onInput={handleInputFor('shopperEmail')}
                    onChange={handleChangeFor('shopperEmail')}
                />
            )}

            {props.showPayButton && props.payButton({ status, label: i18n.get('boletobancario.btnLabel'), classNameModifiers: buttonModifiers })}
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
