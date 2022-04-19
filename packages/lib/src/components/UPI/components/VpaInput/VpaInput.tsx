import useCoreContext from '../../../../core/Context/useCoreContext';
import Field from '../../../internal/FormFields/Field';
import { h } from 'preact';
import useForm from '../../../../utils/useForm';
// import { PixInputDataState } from '../../../Pix/types';
// import { pixValidationRules } from '../../../Pix/PixInput/validate';
// import { pixFormatters } from '../../../Pix/PixInput/utils';
import renderFormField from '../../../internal/FormFields';
import { vpaValidationRules } from './validate';

interface VpaInputProps {
    data?: {};
}

interface VpaInputDataState {
    virtualPaymentAddress?: string;
}

export default function VpaInput(props: VpaInputProps) {
    const { i18n } = useCoreContext();
    const formSchema = ['virtualPaymentAddress'];
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<VpaInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: vpaValidationRules
        // formatters: pixFormatters
    });

    console.log(valid, isValid);

    this.showValidation = () => {
        triggerValidation();
    };

    return (
        <Field label={i18n.get('virtualPaymentAddress')} errorMessage={!!errors.virtualPaymentAddress}>
            {renderFormField('text', {
                name: 'virtualPaymentAddress',
                autocorrect: 'off',
                spellcheck: false,
                value: data.virtualPaymentAddress,
                onInput: handleChangeFor('virtualPaymentAddress', 'input'),
                onBlur: handleChangeFor('virtualPaymentAddress', 'blur')
            })}
        </Field>
    );
}
