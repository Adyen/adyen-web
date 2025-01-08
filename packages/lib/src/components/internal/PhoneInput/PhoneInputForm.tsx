import { h } from 'preact';
import { useEffect, useCallback } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './PhoneInput.scss';
import { phoneFormatters, phoneValidationRules } from './validate';
import { PhoneInputFormProps, PhoneInputSchema } from './types';
import Fieldset from '../FormFields/Fieldset';
import PhoneInputFields from './PhoneInputFields';

/**
 *
 * @param PhoneInputFormProps
 * @constructor
 */
function PhoneInputForm(props: PhoneInputFormProps) {
    const { i18n } = useCoreContext();

    const schema = props.requiredFields || [...(props?.items?.length ? ['phonePrefix'] : []), 'phoneNumber'];
    const showPrefix = schema.includes('phonePrefix') && !!props?.items?.length;
    const showNumber = schema.includes('phoneNumber');

    const form = useForm<PhoneInputSchema>({
        i18n,
        ...props,
        schema,
        defaultData: props.data,
        rules: phoneValidationRules,
        formatters: phoneFormatters
    });

    useEffect(() => {
        form.setSchema(schema);
    }, [schema.toString()]);

    const { data, valid, errors, isValid, triggerValidation } = form;

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.showValidation = triggerValidation;

    // This is here for MBWay, prob should be moved up
    // MBWay has a weird way of loading its error messages
    // They come form the prop phoneNumberErrorKey: 'mobileNumber.invalid'
    // Strangely it's defined as invalidPhoneNumber in the validation rules
    const getPhoneFieldError = useCallback(
        (field: string) => {
            if (errors[field]) {
                const propsField = field === 'phoneNumber' ? 'phoneNumberErrorKey' : 'phonePrefixErrorKey';
                const key = props[propsField] ? props[propsField] : errors[field].errorMessage;
                return i18n.get(key) ?? null;
            }
            return null;
        },
        [errors]
    );

    return (
        <Fieldset classNameModifiers={['phone-input']}>
            <PhoneInputFields getError={getPhoneFieldError} showNumber={showNumber} showPrefix={showPrefix} form={form} {...props} />
        </Fieldset>
    );
}

PhoneInputForm.defaultProps = {
    phoneLabel: 'telephoneNumber'
};

export default PhoneInputForm;
