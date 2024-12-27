import { h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';
import InputText from '../../../internal/FormFields/InputText';
import Field from '../../../internal/FormFields/Field';
import useForm from '../../../../utils/useForm';

interface USOnlyPhoneInputStateData {
    mobileNumber?: string;
}

interface USOnlyPhoneInputProps {
    onChange(mobileNumber: string): void;
}

const USOnlyPhoneInput = ({ onChange }: USOnlyPhoneInputProps) => {
    const formSchema = ['mobileNumber'];
    const { handleChangeFor, data } = useForm<USOnlyPhoneInputStateData>({
        schema: formSchema
    });

    const handleOnKeyPress = useCallback(() => {
        console.log('key press');
    }, []);

    useEffect(() => {
        onChange(data.mobileNumber);
    }, [data.mobileNumber, onChange]);

    return (
        <Field name="mobile-number" label="Mobile number">
            <InputText
                name={'mobile-number'}
                autocorrect={'off'}
                value={data.mobileNumber}
                onInput={handleChangeFor('otp', 'input')}
                onBlur={handleChangeFor('otp', 'blur')}
                onKeyPress={handleOnKeyPress}
            />
        </Field>
    );
};

export default USOnlyPhoneInput;
