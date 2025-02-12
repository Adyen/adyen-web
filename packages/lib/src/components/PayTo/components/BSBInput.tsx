import { h } from 'preact';
import Fieldset from '../../internal/FormFields/Fieldset';
import { useEffect, useRef } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import Field from '../../internal/FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import InputText from '../../internal/FormFields/InputText';
import { bsbValidationRules } from './validate';
import './PayIDInput.scss';
import { phoneFormatters } from '../../internal/PhoneInput/validate';
import { ComponentMethodsRef } from '../../internal/UIElement/types';
import PayToNameFields from './PayToNameFields';
import { PayToPlaceholdersType } from '../types';

export interface BSBFormData {
    bsb: string;
    bankAccountNumber: string;
    firstName: string;
    lastName: string;
}

export interface BSBInputProps {
    defaultData: BSBFormData;
    placeholders: PayToPlaceholdersType;
    onChange: (e) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

const BASE_SCHEMA = ['bankAccountNumber', 'bsb', 'firstName', 'lastName'];

export default function BSBInput({ setComponentRef, defaultData, placeholders, onChange }: BSBInputProps) {
    const { i18n } = useCoreContext();

    const form = useForm<BSBFormData>({
        schema: BASE_SCHEMA,
        defaultData: defaultData,
        rules: bsbValidationRules,
        formatters: phoneFormatters
    });
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid } = form;

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
        <Fieldset classNameModifiers={['payto__bsb_input']} label={'BSB'} description={'payto.bsb.description'}>
            <Field
                label={i18n.get('payto.bsb.label.bankAccountNumber')}
                classNameModifiers={['col-60', 'bankAccountNumber']}
                errorMessage={getErrorMessage(i18n, errors.bankAccountNumber, i18n.get('payto.bsb.label.bankAccountNumber'))}
                name={'bankAccountNumber'}
                i18n={i18n}
            >
                <InputText
                    name={'bankAccountNumber'}
                    value={data.bankAccountNumber}
                    onInput={handleChangeFor('bankAccountNumber', 'input')}
                    onBlur={handleChangeFor('bankAccountNumber', 'blur')}
                    placeholder={placeholders?.bankAccountNumber}
                    required={true}
                />
            </Field>

            <Field
                label={i18n.get('Bank State Branch')}
                classNameModifiers={['col-40', 'bsb']}
                errorMessage={getErrorMessage(i18n, errors.bsb, i18n.get('Bank State Branch'))}
                name={'bsb'}
                i18n={i18n}
            >
                <InputText
                    name={'bsb'}
                    value={data.bsb}
                    onInput={handleChangeFor('bsb', 'input')}
                    onBlur={handleChangeFor('bsb', 'blur')}
                    placeholder={placeholders?.bsb}
                    required={true}
                />
            </Field>

            <PayToNameFields i18n={i18n} data={data} handleChangeFor={handleChangeFor} errors={errors} placeholders={placeholders} />
        </Fieldset>
    );
}
