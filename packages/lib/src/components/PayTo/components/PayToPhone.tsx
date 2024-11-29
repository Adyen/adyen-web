import { h } from 'preact';
import usePhonePrefixes from '../../internal/PhoneInput/usePhonePrefixes';
import PhoneInput from '../../internal/PhoneInput';
import { useCoreContext } from '../../../core/Context/CoreProvider';

interface PayToPhoneProps {
    onChange: (value: string) => void;
    onError: (error: Error) => void;
    data: any; // Data
}

// TODO change data
export default function PayToPhone({ onChange, onError, data }: PayToPhoneProps) {
    const { loadingContext } = useCoreContext();

    const allowedCountries = [];

    const { loadingStatus: prefixLoadingStatus, phonePrefixes } = usePhonePrefixes({ allowedCountries, loadingContext, handleError: onError });

    return <PhoneInput items={phonePrefixes} data={data} onChange={onChange} />;
}
