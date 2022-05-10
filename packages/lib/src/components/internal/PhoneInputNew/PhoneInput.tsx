import { h } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import classNames from 'classnames';
import Field from '../FormFields/Field';
import renderFormField from '../FormFields';
import useForm from '../../../utils/useForm';
import useCoreContext from '../../../core/Context/useCoreContext';
// import './PhoneInput.scss';
import '../PhoneInput/PhoneInput.scss';
import { phoneFormatters, phoneValidationRules } from './validate';
// import { PhoneInputProps, PhoneInputSchema } from './types';
import { PhoneInputSchema } from './types';
// import formUtilities from '../../../utils/formUtils';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';
import { getUniqueId } from '../../../utils/idGenerator';

export const phoneFields: Array<keyof PhoneInputSchema> = ['phonePrefix', 'phoneNumber'];

// function PhoneInput(props: PhoneInputProps) {
function PhoneInput(props) {
    const {
        i18n,
        commonProps: { isCollatingErrors }
    } = useCoreContext();
    const [mappedPrefixes, setMappedPrefixes] = useState([]);

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
        if (showPrefix) {
            setMappedPrefixes(
                props.items.map(item => ({
                    ...item,
                    sprite: `#adl-flag-${item.id.toLowerCase()}`
                }))
            );
        }
    }, [showPrefix]);

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
     * However here we have a different use case and the uniqueId is written to the <div class="adyen-kyc-input"> which in this case
     *  is the first child of the <Field>.
     * In order to retrieve this uniqueId and assign it to the phoneNumber input (to thus link <label> and <input> - we need this function.
     */
    const getRelatedUniqueId = () => {
        const holder = document.querySelector('.adyen-kyc-phone-input [uniqueid]');
        return holder ? holder.getAttribute('uniqueid') : null;
    };

    const getPhoneFieldError = useCallback(
        field => {
            const errMsg = i18n.get(errors[field]?.errorMessage);
            return errMsg ? errMsg : null;
        },
        [errors]
    );

    const uniqueIDPhonePrefix = useMemo(() => {
        return getUniqueId('adyen-kyc-phonePrefix');
    }, []);

    return (
        <div className="adyen-kyc-phone-input">
            <Field
                name={'phoneNumber'}
                label={i18n.get('mobileNumber')}
                className={classNames({
                    'adyen-kyc-phone-input__holder': true
                })}
                inputWrapperModifiers={['phoneInput']}
                isValid={valid.phoneNumber}
            >
                <div
                    className={classNames({
                        'adyen-kyc-input': true,
                        'adyen-kyc-input--invalid': !!errors.phoneNumber || !!errors.phonePrefix,
                        'adyen-kyc-field--valid': (showPrefix ? valid.phonePrefix : true) && valid.phoneNumber,
                        'adyen-kyc-input__phoneInput': true // Better BEM naming
                    })}
                >
                    {showPrefix &&
                        renderFormField('select', {
                            className: 'adyen-kyc-countrycode-selector ',
                            items: mappedPrefixes,
                            onChange: handleChangeFor('phonePrefix'),
                            // readonly: formUtils.isReadOnly('phonePrefix'),
                            // placeholder: formUtils.getPlaceholder('phonePrefix', 'code'),
                            selected: data.phonePrefix,
                            isCollatingErrors,
                            uniqueId: uniqueIDPhonePrefix
                        })}

                    {showNumber && (
                        <div className="adyen-kyc-phone-number">
                            <input
                                id={getRelatedUniqueId()}
                                type="tel"
                                value={data.phoneNumber}
                                onInput={handleChangeFor('phoneNumber', 'input')}
                                onBlur={handleChangeFor('phoneNumber', 'blur')}
                                // readOnly={formUtils.isReadOnly('phoneNumber')}
                                // placeholder={formUtils.getPlaceholder('phoneNumber', '123456789')}
                                className="adyen-kyc-input adyen-kyc-input__phone-number"
                                autoCorrect="off"
                                aria-required={true}
                                aria-label={i18n.get('mobileNumber')}
                                aria-invalid={!valid.phoneNumber}
                                aria-describedby={`${getRelatedUniqueId()}${ARIA_ERROR_SUFFIX}`}
                            />
                        </div>
                    )}
                </div>
            </Field>
            {props.showInlineErrors && (
                <div className="adyen-kyc-phone-input__error-holder">
                    {showPrefix && getPhoneFieldError('phonePrefix') && (
                        <span className={'adyen-kyc-error-text'} aria-live="polite" id={`${uniqueIDPhonePrefix}${ARIA_ERROR_SUFFIX}`}>
                            {getPhoneFieldError('phonePrefix')}
                        </span>
                    )}
                    {showNumber && getPhoneFieldError('phoneNumber') && (
                        <span className={'adyen-kyc-error-text'} aria-live="polite" id={`${getRelatedUniqueId()}${ARIA_ERROR_SUFFIX}`}>
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
