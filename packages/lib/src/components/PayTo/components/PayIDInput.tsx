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
import { payIdValidationRules } from './validate';

export interface PayIdFormData {
    email: string;
    phone: string;
    abn: string;
    orgid: string;
    firstName: string;
    lastName: string;
}

export default function PayIDInput(props) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, triggerValidation, data, errors } = useForm<PayIdFormData>({
        schema: ['email', 'abn', 'phone', 'orgid'],
        rules: payIdValidationRules
    });

    //this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    // TODO fix all these letters - as in this is quite a long class
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
                    errorMessage={getErrorMessage(i18n, errors.email, i18n.get('shopperEmail'))}
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
                    classNameModifiers={['col-60', 'abn']}
                    errorMessage={getErrorMessage(i18n, errors.abn, i18n.get('abn'))}
                    name={'ABN'}
                    i18n={i18n}
                >
                    <InputEmail
                        name={'ABN'}
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
                    classNameModifiers={['col-60', 'orgid']}
                    errorMessage={getErrorMessage(i18n, errors.orgid, i18n.get('abn'))}
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
