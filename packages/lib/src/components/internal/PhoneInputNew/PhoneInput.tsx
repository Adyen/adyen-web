import { h } from 'preact';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import classNames from 'classnames';
import Field from '../FormFields/Field';
import renderFormField from '../FormFields';
import useForm from '../../../utils/useForm';
import useCoreContext from '../../../core/Context/useCoreContext';
import './PhoneInput.scss';
import { phoneFormatters, phoneValidationRules } from './validate';
// import { PhoneInputProps, PhoneInputSchema } from './types';
import { PhoneInputSchema } from './types';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';
import { getUniqueId } from '../../../utils/idGenerator';

export const phoneFields: Array<keyof PhoneInputSchema> = ['phonePrefix', 'phoneNumber'];

// function PhoneInput(props: PhoneInputProps) {
function PhoneInput(props) {
    const {
        i18n,
        commonProps: { isCollatingErrors }
    } = useCoreContext();

    const schema = props.requiredFields || [...(props?.items?.length ? ['phonePrefix'] : []), 'phoneNumber'];
    const showPrefix = schema.includes('phonePrefix') && !!props?.items?.length;
    const showNumber = schema.includes('phoneNumber');

    const { handleChangeFor, data, valid, errors, isValid, triggerValidation, setSchema } = useForm<PhoneInputSchema>({
        i18n,
        ...props,
        schema,
        defaultData: props.data,
        rules: props.validators || phoneValidationRules,
        formatters: phoneFormatters
    });

    useEffect(() => {
        setSchema(schema);
    }, [schema.toString()]);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.triggerValidation = triggerValidation;

    /**
     * The <Field> element assigns a uniqueId which it uses for the \<label for=\> attribute.
     * This uniqueId is then passed as a prop to the first child of the field
     *  (which is usually an element created by renderFormField) where it is assigned to the id attribute of that element.
     * However here we have a different use case and the uniqueId is written to the <div class="adyen-checkout__input"> which in this case
     *  is the first child of the <Field>.
     * In order to retrieve this uniqueId and assign it to the phoneNumber input (to thus link <label> and <input> - we need this function.
     */
    const getRelatedUniqueId = () => {
        const holder = document.querySelector('.adyen-checkout__phone-input-new [uniqueid]');
        return holder ? holder.getAttribute('uniqueid') : null;
    };

    const getPhoneFieldError = useCallback(
        field => {
            if (errors[field]) {
                const propsField = field === 'phoneNumber' ? 'phoneNumberErrorKey' : 'phonePrefixErrorKey';
                const key = props[propsField] ? props[propsField] : errors[field].errorMessage;
                const errMsg = i18n.get(key);
                return errMsg ? errMsg : null;
            }
            return null;
        },
        [errors]
    );

    const uniqueIDPhonePrefix = useMemo(() => {
        return getUniqueId('adyen-checkout-phonePrefix');
    }, []);

    return (
        <div className="adyen-checkout__phone-input-new">
            <Field
                name={'phoneNumber'}
                label={props.phoneNumberKey ? i18n.get(props.phoneNumberKey) : i18n.get('telephoneNumber')}
                className={classNames({
                    'adyen-checkout__input--phone-number': true
                })}
                inputWrapperModifiers={['phoneInput']}
                isValid={valid.phoneNumber}
            >
                <div
                    className={classNames({
                        'adyen-checkout__input': true,
                        'adyen-checkout__input--invalid': !!errors.phoneNumber || !!errors.phonePrefix,
                        'adyen-checkout__input--valid': (showPrefix ? valid.phonePrefix : true) && valid.phoneNumber,
                        'adyen-checkout-input__phoneInput': true // Better BEM naming
                    })}
                >
                    {showPrefix &&
                        renderFormField('select', {
                            className: 'adyen-checkout-countrycode-selector ',
                            items: props.items,
                            onChange: handleChangeFor('phonePrefix'),
                            // readonly: props.phonePrefixIsReadonly,
                            placeholder: i18n.get('infix'),
                            selected: data.phonePrefix,
                            isCollatingErrors,
                            uniqueId: uniqueIDPhonePrefix
                        })}

                    {showNumber && (
                        <div className="adyen-checkout-phone-number">
                            <input
                                id={getRelatedUniqueId()}
                                type="tel"
                                value={data.phoneNumber}
                                onInput={handleChangeFor('phoneNumber', 'input')}
                                onBlur={handleChangeFor('phoneNumber', 'blur')}
                                // readOnly={props.phoneNumberIsReadonly}
                                placeholder={props.placeholders.phoneNumber || '123456789'}
                                className="adyen-checkout__input adyen-checkout-input__phone-number"
                                autoCorrect="off"
                                aria-required={true}
                                aria-label={props.phoneNumberKey ? i18n.get(props.phoneNumberKey) : i18n.get('telephoneNumber')}
                                aria-invalid={!valid.phoneNumber}
                                aria-describedby={`${getRelatedUniqueId()}${ARIA_ERROR_SUFFIX}`}
                            />
                        </div>
                    )}
                </div>
            </Field>
            {!isCollatingErrors && (
                <div className="adyen-checkout-phone-input__error-holder">
                    {showPrefix && getPhoneFieldError('phonePrefix') && (
                        <span className={'adyen-checkout__error-text'} aria-live="polite" id={`${uniqueIDPhonePrefix}${ARIA_ERROR_SUFFIX}`}>
                            {getPhoneFieldError('phonePrefix')}
                        </span>
                    )}
                    {showNumber && getPhoneFieldError('phoneNumber') && (
                        <span className={'adyen-checkout__error-text'} aria-live="polite" id={`${getRelatedUniqueId()}${ARIA_ERROR_SUFFIX}`}>
                            {getPhoneFieldError('phoneNumber')}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

PhoneInput.defaultProps = {
    phoneLabel: 'telephoneNumber'
};

export default PhoneInput;
