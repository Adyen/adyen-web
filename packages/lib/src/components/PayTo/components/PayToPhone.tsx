import { h } from 'preact';
import usePhonePrefixes from '../../internal/PhoneInput/usePhonePrefixes';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import PhoneInputFields from '../../internal/PhoneInput/PhoneInputFields';
import { Form } from '../../../utils/useForm/types';
import { PayIdFormData } from './PayIDInput';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCallback } from 'preact/hooks';

interface PayToPhoneProps {
    form: Form<PayIdFormData>;
    onChange: (value: string) => void;
    onError: (error: Error) => void;
    data: any; // Data
}

export default function PayToPhone({ form, onChange, onError, data }: PayToPhoneProps) {
    const { loadingContext, i18n } = useCoreContext();

    const allowedCountries = [];

    const { loadingStatus: prefixLoadingStatus, phonePrefixes } = usePhonePrefixes({ allowedCountries, loadingContext, handleError: onError });

    // TODO handle the loading status
    console.log('TODO', prefixLoadingStatus);

    const getError = useCallback((field: string) => getErrorMessage(i18n, form.errors[field]), [i18n, form]);

    return (
        <PhoneInputFields getError={getError} items={phonePrefixes} data={data} onChange={onChange} showNumber={true} showPrefix={true} form={form} />
    );
}
