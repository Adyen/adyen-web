import { h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';
import Field from '../FormFields/Field';
import useForm from '../../../utils/useForm';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './PhoneInput.scss';
import Select from '../FormFields/Select';
import { phoneFormatters, phoneValidationRules } from './validate';
import { PhoneInputProps, PhoneInputSchema } from './types';
import InputText from '../FormFields/InputText';
import Fieldset from '../FormFields/Fieldset';

/**
 *
 * @param PhoneInputProps
 * @constructor
 */
function PhoneInput(props: PhoneInputProps) {
    const { i18n } = useCoreContext();

    const schema = props.requiredFields || [...(props?.items?.length ? ['phonePrefix'] : []), 'phoneNumber'];
    const showPrefix = schema.includes('phonePrefix') && !!props?.items?.length;
    const showNumber = schema.includes('phoneNumber');

    const { handleChangeFor, data, valid, errors, isValid, triggerValidation, setSchema } = useForm<PhoneInputSchema>({
        i18n,
        ...props,
        schema,
        defaultData: props.data,
        rules: phoneValidationRules,
        formatters: phoneFormatters
    });

    useEffect(() => {
        setSchema(schema);
    }, [schema.toString()]);

    // Force re-validation of the phoneNumber when data.phonePrefix changes (since the validation rules will also change)
    useEffect((): void => {
        if (data.phoneNumber) {
            handleChangeFor('phoneNumber', 'blur')(data.phoneNumber);
        }
    }, [data.phonePrefix]);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.triggerValidation = triggerValidation;

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
            {showPrefix && (
                <Field
                    className={'adyen-checkout-field--phone-prefix'}
                    label={i18n.get('telephonePrefix')}
                    errorMessage={getPhoneFieldError('phonePrefix')}
                    showValidIcon={false}
                    isValid={valid.phonePrefix}
                    dir={'ltr'}
                    i18n={i18n}
                    name={'phonePrefix'}
                >
                    <Select
                        className={'adyen-checkout-dropdown adyen-checkout-dropdown--countrycode-selector'}
                        name={'phonePrefix'}
                        items={props.items}
                        onChange={handleChangeFor('phonePrefix')}
                        placeholder={props?.placeholders?.phonePrefix}
                        selectedValue={data.phonePrefix}
                    />
                </Field>
            )}

            {showNumber && (
                <Field
                    className={'adyen-checkout-field--phone-number'}
                    label={props.phoneNumberKey ? i18n.get(props.phoneNumberKey) : i18n.get('telephoneNumber')}
                    errorMessage={getPhoneFieldError('phoneNumber')}
                    isValid={valid.phoneNumber}
                    filled={data?.phoneNumber?.length > 0}
                    dir={'ltr'}
                    i18n={i18n}
                    name={'phoneNumber'}
                >
                    <InputText
                        className="adyen-checkout__input adyen-checkout-input adyen-checkout-input--phone-number"
                        type="tel"
                        name="phoneNumber"
                        value={data.phoneNumber}
                        onInput={handleChangeFor('phoneNumber', 'input')}
                        onBlur={handleChangeFor('phoneNumber', 'blur')}
                        placeholder={props?.placeholders?.phoneNumber}
                        autoCorrect="off"
                        required={true}
                    />
                </Field>
            )}
        </Fieldset>
    );
}

PhoneInput.defaultProps = {
    phoneLabel: 'telephoneNumber'
};

export default PhoneInput;
