import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';
import Field from '../FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './PhoneInput.scss';
import Select from '../FormFields/Select';
import { PhoneInputSchema } from './types';
import InputText from '../FormFields/InputText';
import { DataSet } from '../../../core/Services/data-set';
import { Form } from '../../../utils/useForm/types';

export interface PhoneInputFieldProps {
    items: DataSet;
    requiredFields?: string[];
    form: Form<PhoneInputSchema>;
    getError: (key: string) => string | boolean;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: PhoneInputSchema;
    showPrefix?: boolean;
    showNumber?: boolean;
    canSelectPrefix?: boolean;
}
/**
 *
 * @param PhoneInputFormProps
 * @constructor
 */
export default function PhoneInputFields({ getError, showNumber, showPrefix, form, canSelectPrefix = true, ...props }: PhoneInputFieldProps) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, data, valid } = form;

    // Force re-validation of the phoneNumber when data.phonePrefix changes (since the validation rules will also change)
    useEffect((): void => {
        if (data.phoneNumber) {
            handleChangeFor('phoneNumber', 'blur')(data.phoneNumber);
        }
    }, [data.phonePrefix]);

    return (
        <Fragment>
            {showPrefix && (
                <Field
                    className={'adyen-checkout-field--phone-prefix'}
                    label={i18n.get('telephonePrefix')}
                    errorMessage={getError('phonePrefix')}
                    showValidIcon={false}
                    isValid={valid.phonePrefix}
                    dir={'ltr'}
                    i18n={i18n}
                    name={'phonePrefix'}
                >
                    <Select
                        readonly={!canSelectPrefix}
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
                    errorMessage={getError('phoneNumber')}
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
        </Fragment>
    );
}
