import { h } from 'preact';
import Fieldset from '../../internal/FormFields/Fieldset';
import IdentifierSelector, { PayToIdentifierEnum, PayToPayIDInputIdentifierValues } from './IdentifierSelector';
import { useEffect, useState } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import PayToPhone from './PayToPhone';
import InputEmail from '../../internal/FormFields/InputEmail';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import Field from '../../internal/FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import InputText from '../../internal/FormFields/InputText';
import { ValidatorRule, ValidatorRules } from '../../../utils/Validator/types';
import { ERROR_FIELD_INVALID, ERROR_FIELD_REQUIRED } from '../../../core/Errors/constants';
import { isEmpty } from '../../../utils/validator-utils';
import { validationRules } from '../../../utils/Validator/defaultRules';

export interface PayIdFormData {
    email: string;
    phone: string;
    abn: string;
    orgid: string;
    firstName: string;
    lastName: string;
}

//const emailRegex = /^_`{|}~-]+)@(?:[a-z0-9](?:[a-z0-9-][a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/;

const abnRegex = /^((\d{9})|(\d{11}))$/;

const orgidRegex = /`^[!-@[-~][ -@[-~]{0,254}[!-@[-~]$`/;

// TODO probably move this generic function somewhere else
const createValidationFuncFromRegex =
    (regex: RegExp) =>
    (value: string, validationRule: ValidatorRule): boolean | null => {
        if (isEmpty(value)) {
            validationRule.errorMessage = ERROR_FIELD_REQUIRED;
            return null;
        }
        validationRule.errorMessage = ERROR_FIELD_INVALID;
        return regex.test(value);
    };

export const payIdValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        errorMessage: ERROR_FIELD_REQUIRED,
        modes: ['blur']
    },
    email: {
        //TODO check this
        ...validationRules.emailRule
    },
    abn: {
        validate: createValidationFuncFromRegex(abnRegex),
        errorMessage: 'abn.invalid',
        modes: ['blur']
    },
    orgid: {
        validate: createValidationFuncFromRegex(orgidRegex),
        errorMessage: 'orgid.invalid',
        modes: ['blur']
    },
    firstName: {
        validate: value => (isEmpty(value) ? null : true), // valid, if there are chars other than spaces,
        errorMessage: 'firstName.invalid',
        modes: ['blur']
    },
    lastName: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'lastName.invalid',
        modes: ['blur']
    }
};

export default function PayIDInput(props) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, triggerValidation, data, valid, errors } = useForm<PayIdFormData>({
        schema: ['email', 'abn', 'phone', 'orgid'],
        rules: payIdValidationRules
    });

    // this.setStatus = setStatus;
    // this.showValidation = triggerValidation;

    // TODO fix all these letters
    // TODO double check if what should be default value
    const [selectedIdentifier, setSelectedIdentifier] = useState<PayToPayIDInputIdentifierValues>(PayToIdentifierEnum.email);
    console.log(selectedIdentifier);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <Fieldset classNameModifiers={['adyen-checkout-payto__payid_input']} label={'payto.payid.header'} description={'payto.payid.description'}>
            <IdentifierSelector
                classNameModifiers={['col-40']}
                onSelectedIdentifier={setSelectedIdentifier}
                selectedIdentifier={selectedIdentifier}
            />
            {selectedIdentifier === PayToIdentifierEnum.phone && (
                <PayToPhone onChange={handleChangeFor('phone')} onError={props.onError} data={data} />
            )}

            {selectedIdentifier === PayToIdentifierEnum.email && (
                <Field
                    label={i18n.get('shopperEmail')}
                    classNameModifiers={['col-60', 'email']}
                    errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                    dir={'ltr'}
                    name={'email'}
                    i18n={i18n}
                >
                    <InputEmail
                        name={'email'}
                        value={data.email}
                        onInput={handleChangeFor('email', 'input')}
                        onBlur={handleChangeFor('email', 'blur')}
                        //TODO placeholder={placeholders.shopperEmail}
                        required={true}
                    />
                </Field>
            )}

            {selectedIdentifier === PayToIdentifierEnum.abn && (
                <Field
                    label={i18n.get('payto.payid.label.abn')}
                    classNameModifiers={['abn']}
                    //errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('abn'))}
                    name={'abn'}
                    i18n={i18n}
                >
                    <InputEmail
                        name={'abn'}
                        value={data.abn}
                        onInput={handleChangeFor('abn', 'input')}
                        onBlur={handleChangeFor('abn', 'blur')}
                        //TODO placeholder={placeholders.shopperEmail}
                        required={true}
                    />
                </Field>
            )}

            {selectedIdentifier === PayToIdentifierEnum.orgid && (
                <Field
                    label={i18n.get('payto.payid.label.orgid')}
                    classNameModifiers={['orgid']}
                    //errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('abn'))}
                    name={'orgid'}
                    i18n={i18n}
                >
                    <InputEmail
                        name={'abn'}
                        value={data.abn}
                        onInput={handleChangeFor('abn', 'input')}
                        onBlur={handleChangeFor('abn', 'blur')}
                        //TODO placeholder={placeholders.shopperEmail}
                        required={true}
                    />
                </Field>
            )}

            <Field
                label={i18n.get('firstName')}
                classNameModifiers={['col-50', 'firstName']}
                errorMessage={getErrorMessage(i18n, errors.firstName, i18n.get('firstName'))}
                name={'firstName'}
                i18n={i18n}
            >
                <InputText
                    name={'firstName'}
                    value={data.firstName}
                    classNameModifiers={['firstName']}
                    onInput={handleChangeFor('firstName', 'input')}
                    onBlur={handleChangeFor('firstName', 'input')}
                    //placeholder={placeholders.firstName}
                    spellCheck={false}
                    required={true}
                />
            </Field>

            <Field
                label={i18n.get('lastName')}
                classNameModifiers={['col-50', 'lastName']}
                errorMessage={getErrorMessage(i18n, errors.lastName, i18n.get('lastName'))}
                name={'lastName'}
                i18n={i18n}
            >
                <InputText
                    name={'lastName'}
                    value={data.lastName}
                    classNameModifiers={['lastName']}
                    onInput={handleChangeFor('lastName', 'input')}
                    onBlur={handleChangeFor('onBlue', 'blur')}
                    //placeholder={placeholders.lastName}
                    spellCheck={false}
                    required={true}
                />
            </Field>
        </Fieldset>
    );
}
