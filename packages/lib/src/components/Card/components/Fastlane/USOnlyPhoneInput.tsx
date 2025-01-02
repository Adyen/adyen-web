import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import Field from '../../../internal/FormFields/Field';
import useForm from '../../../../utils/useForm';
import InputTelephone from '../../../internal/FormFields/InputTelephone';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import mobileNumberFormatter from './utils/mobile-number-formatter';

interface USOnlyPhoneInputStateData {
    mobileNumber?: string;
}

interface USOnlyPhoneInputProps {
    onChange(mobileNumber: string): void;
}

const USOnlyPhoneInput = ({ onChange }: USOnlyPhoneInputProps) => {
    const { i18n } = useCoreContext();
    const formSchema = ['mobileNumber'];
    const { handleChangeFor, data } = useForm<USOnlyPhoneInputStateData>({
        schema: formSchema,
        formatters: {
            mobileNumber: mobileNumberFormatter
        }
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const focusInput = useCallback(() => {
        inputRef.current?.focus();
    }, [inputRef.current]);

    useEffect(() => {
        onChange(data.mobileNumber?.replaceAll(' ', ''));
    }, [data.mobileNumber, onChange]);

    return (
        <Field name="mobile-number" label={i18n.get('card.fastlane.mobileInputLabel')} staticValue="+1" onInputContainerClick={focusInput}>
            <InputTelephone
                name={'mobile-number'}
                autocorrect={'off'}
                spellcheck={false}
                maxlength={12}
                value={data.mobileNumber}
                onInput={handleChangeFor('mobileNumber', 'input')}
                onBlur={handleChangeFor('mobileNumber', 'blur')}
                setRef={inputRef}
            />
        </Field>
    );
};

export default USOnlyPhoneInput;
