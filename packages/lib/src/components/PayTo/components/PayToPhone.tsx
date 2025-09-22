import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import PhoneInputFields from '../../internal/PhoneInput/PhoneInputFields';
import { Form } from '../../../utils/useForm/types';
import { PayIdFormData } from './PayIDInput';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCallback } from 'preact/hooks';

interface PayToPhoneProps {
    form: Form<PayIdFormData>;
}

// we have decided to hardcode phone prefix as it's going to be always +61 for now
const AUSTRALIAN_PHONE_PREFIXES = [
    {
        id: '+61',
        name: '+61 (AU)',
        selectedOptionName: '+61'
    }
];

export default function PayToPhone({ form }: PayToPhoneProps) {
    const { i18n } = useCoreContext();

    const getError = useCallback((field: string) => getErrorMessage(i18n, form.errors[field]), [i18n, form]);

    return (
        <PhoneInputFields
            phoneNumberKey={'mobileNumber'}
            getError={getError}
            items={AUSTRALIAN_PHONE_PREFIXES}
            canSelectPrefix={false}
            showNumber={true}
            showPrefix={true}
            form={form}
        />
    );
}
