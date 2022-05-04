import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { otpValidationRules } from './validate';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../utils/useForm';
import Field from '../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../internal/FormFields';
import './CtPOneTimePasswordInput.scss';

interface Props {
    disabled: boolean;
    data?: {};
    onChange({ data: CtPOneTimePasswordInputDataState, valid, errors, isValid: boolean }): void;
}

interface CtPOneTimePasswordInputDataState {
    otp?: string;
}

const CtPOneTimePasswordInput = (props: Props) => {
    const { i18n } = useCoreContext();
    const formSchema = ['otp'];
    const { handleChangeFor, data, valid, errors, isValid } = useForm<CtPOneTimePasswordInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: otpValidationRules
    });

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <Field label={i18n.get('One time code')} errorMessage={!!errors.otp} classNameModifiers={['otp']}>
            {renderFormField('text', {
                name: 'otp',
                autocorrect: 'off',
                spellcheck: false,
                value: data.otp,
                disabled: props.disabled,
                onInput: handleChangeFor('otp', 'input'),
                onBlur: handleChangeFor('otp', 'blur')
            })}
        </Field>
    );
};

export default CtPOneTimePasswordInput;
