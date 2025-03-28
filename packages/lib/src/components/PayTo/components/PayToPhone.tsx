import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import PhoneInputFields from '../../internal/PhoneInput/PhoneInputFields';
import { Form } from '../../../utils/useForm/types';
import { PayIdFormData } from './PayIDInput';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCallback } from 'preact/hooks';

interface PayToPhoneProps {
    form: Form<PayIdFormData>;
    onChange: (value: string) => void;
    data: any; // Data
}

// we have decided to hardcode phone prefix as it's going to be always +61 for now
const HARDCODED_USE_PHONE_PREFIXES = {
    phonePrefixes: [
        {
            id: '+61',
            name: '+61 (AU)',
            selectedOptionName: '+61'
        }
    ]
};

export default function PayToPhone({ form, onChange, data }: PayToPhoneProps) {
    const { i18n } = useCoreContext();

    const { phonePrefixes } = HARDCODED_USE_PHONE_PREFIXES;

    const getError = useCallback((field: string) => getErrorMessage(i18n, form.errors[field]), [i18n, form]);

    return (
        <PhoneInputFields
            phoneNumberKey={'mobileNumber'}
            getError={getError}
            items={phonePrefixes}
            data={data}
            onChange={onChange}
            canSelectPrefix={false}
            showNumber={true}
            showPrefix={true}
            form={form}
        />
    );
}
