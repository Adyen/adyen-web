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
import { ComponentMethodsRef, UIElementStatus } from '../../internal/UIElement/types';
import PayToNameFields from './PayToNameFields';
import { PayToPlaceholdersType } from '../types';

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
    status: UIElementStatus;
    setStatus: (status: UIElementStatus) => void;
    defaultData: PayIdFormData;
    placeholders: PayToPlaceholdersType;
    onChange: (e) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    id?: string;
}

const BASE_SCHEMA = ['selectedIdentifier', 'firstName', 'lastName'];

const IDENTIFIER_SCHEMA = {
    [PayToIdentifierEnum.email]: ['email'],
    [PayToIdentifierEnum.phone]: ['phoneNumber', 'phonePrefix'],
    [PayToIdentifierEnum.abn]: ['abn'],
    [PayToIdentifierEnum.orgid]: ['orgid']
};

export default function PayIDInput({ setComponentRef, defaultData, placeholders, onChange, setStatus, id }: PayIDInputProps) {
    const { i18n } = useCoreContext();

    const form = useForm<PayIdFormData>({
        schema: BASE_SCHEMA,
        defaultData: { selectedIdentifier: PayToIdentifierEnum.phone, ...defaultData },
        rules: payIdValidationRules,
        formatters: phoneFormatters
    });
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid, setSchema } = form;

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
        setStatus: setStatus,
        showValidation: triggerValidation
    });

    useEffect(() => {
        setComponentRef(payToRef.current);
    }, [setComponentRef]);

    return (
        <Fieldset id={id} classNameModifiers={['payto__payid_input']} label={'PayID'} description={'payto.payid.description'}>
            <IdentifierSelector
                classNameModifiers={['col-40']}
                onSelectedIdentifier={handleChangeFor('selectedIdentifier')}
                selectedIdentifier={data.selectedIdentifier}
            />
            {data.selectedIdentifier === PayToIdentifierEnum.phone && <PayToPhone form={form} />}

            {/* TODO probably worth refactoring this into  either re-usable components or builder */}
            {data.selectedIdentifier === PayToIdentifierEnum.email && (
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
                        placeholder={placeholders?.email}
                        required={true}
                    />
                </Field>
            )}

            {data.selectedIdentifier === PayToIdentifierEnum.abn && (
                <Field
                    label={i18n.get('ABN')}
                    classNameModifiers={['col-60', 'abn']}
                    errorMessage={getErrorMessage(i18n, errors.abn, i18n.get('ABN'))}
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
                    classNameModifiers={['col-60', 'orgid']}
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

            <PayToNameFields i18n={i18n} data={data} handleChangeFor={handleChangeFor} errors={errors} placeholders={placeholders} />
        </Fieldset>
    );
}
