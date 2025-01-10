import { h } from 'preact';
import Fieldset from '../../internal/FormFields/Fieldset';
import IdentifierSelector, { PayToIdentifierEnum } from './IdentifierSelector';
import { useEffect, useRef } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import PayToPhone from './PayToPhone';
import InputEmail from '../../internal/FormFields/InputEmail';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import Field from '../../internal/FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import InputText from '../../internal/FormFields/InputText';
import { payIdValidationRules } from './validate';
import './PayIDInput.scss';
import { phoneFormatters } from '../../internal/PhoneInput/validate';
import { ComponentMethodsRef } from '../../internal/UIElement/types';

export interface PayIdFormData {
    email: string;
    phone: string;
    abn: string;
    orgid: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    phonePrefix?: string;
    selectedIdentifier: PayToIdentifierEnum;
}

export interface PayIDInputProps {
    defaultData: PayIdFormData;
    placeholders: any; //TODO
    onError: () => {};
    onChange: (e) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

const BASE_SCHEMA = ['selectedIdentifier', 'firstName', 'lastName'];

const IDENTIFIER_SCHEMA = {
    [PayToIdentifierEnum.email]: ['email'],
    [PayToIdentifierEnum.phone]: ['phoneNumber', 'phonePrefix'],
    [PayToIdentifierEnum.abn]: ['abn'],
    [PayToIdentifierEnum.orgid]: ['orgid']
};

export interface KlarnaComponentRef extends ComponentMethodsRef {}

export default function PayIDInput({ setComponentRef, defaultData, placeholders, onError, onChange }: PayIDInputProps) {
    const { i18n } = useCoreContext();

    const form = useForm<PayIdFormData>({
        schema: BASE_SCHEMA,
        defaultData: { selectedIdentifier: PayToIdentifierEnum.phone, ...defaultData },
        rules: payIdValidationRules,
        formatters: phoneFormatters
    });
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid, setSchema } = form;

    //this.setStatus = setStatus;
    this.triggerValidation = triggerValidation;

    // handle the changes of identifier, each identifier gets its own schema
    useEffect(() => {
        // get the correct schema for each identifier and merge it with the base
        setSchema([...IDENTIFIER_SCHEMA[data.selectedIdentifier], ...BASE_SCHEMA]);
    }, [data.selectedIdentifier]);

    // standard onChange propagate to parent state
    useEffect(() => {
        onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    const payToRef = useRef<ComponentMethodsRef>({
        showValidation: triggerValidation
    });

    useEffect(() => {
        setComponentRef(payToRef.current);
    }, [setComponentRef]);

    return (
        <Fieldset classNameModifiers={['payto__payid_input']} label={'payto.payid.header'} description={'payto.payid.description'}>
            <IdentifierSelector
                classNameModifiers={['col-30']}
                onSelectedIdentifier={handleChangeFor('selectedIdentifier')}
                selectedIdentifier={data.selectedIdentifier}
            />
            {data.selectedIdentifier === PayToIdentifierEnum.phone && (
                <PayToPhone onChange={handleChangeFor('phone', 'blur')} onError={onError} data={data} form={form} />
            )}

            {/* TODO probably worth refactoring this into  either re-usable components or builder */}
            {data.selectedIdentifier === PayToIdentifierEnum.email && (
                <Field
                    label={i18n.get('shopperEmail')}
                    classNameModifiers={['col-70', 'email']}
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
                        placeholder={placeholders?.shopperEmail}
                        required={true}
                    />
                </Field>
            )}

            {data.selectedIdentifier === PayToIdentifierEnum.abn && (
                <Field
                    label={i18n.get('payto.payid.label.abn')}
                    classNameModifiers={['col-70', 'abn']}
                    errorMessage={getErrorMessage(i18n, errors.abn, i18n.get('payto.payid.label.abn'))}
                    name={'ABN'}
                    i18n={i18n}
                >
                    <InputText
                        name={'abn'}
                        value={data.abn}
                        onInput={handleChangeFor('abn', 'input')}
                        onBlur={handleChangeFor('abn', 'blur')}
                        placeholder={placeholders?.abn}
                        required={true}
                    />
                </Field>
            )}

            {data.selectedIdentifier === PayToIdentifierEnum.orgid && (
                <Field
                    label={i18n.get('payto.payid.label.orgid')}
                    classNameModifiers={['col-70', 'orgid']}
                    errorMessage={getErrorMessage(i18n, errors.orgid, i18n.get('payto.payid.label.orgid'))}
                    name={'orgid'}
                    i18n={i18n}
                >
                    <InputText
                        name={'orgid'}
                        value={data.orgid}
                        onInput={handleChangeFor('orgid', 'input')}
                        onBlur={handleChangeFor('orgid', 'blur')}
                        placeholder={placeholders?.orgid}
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
                    placeholder={placeholders?.firstName}
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
                    onBlur={handleChangeFor('lastName', 'blur')}
                    placeholder={placeholders?.lastName}
                    spellCheck={false}
                    required={true}
                />
            </Field>
        </Fieldset>
    );
}
