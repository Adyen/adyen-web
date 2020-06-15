import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '~/core/Context/useCoreContext';
import styles from './MBWayInput.module.scss';
import './MBWayInput.scss';
import Field from '~/components/internal/FormFields/Field';
import { renderFormField } from '~/components/internal/FormFields';
import { mbwayValidationRules } from '~/components/MBWay/components/MBWayInput/validate';
import Validator from '~/utils/Validator';
import { UIElementProps } from '../../../UIElement';

type RtnTypeFnWithEvent = (e: Event) => void;

interface MBWayDataObject {
    email: string;
    phoneNumber: string;
}

interface MBWayErrorsObject {
    email: boolean;
    phoneNumber: boolean;
}

interface MBWayValidObject {
    email: boolean;
    phoneNumber: boolean;
}

interface ValidationObj {
    value: string;
    isValid: boolean;
}

function MBWayInput(props: UIElementProps) {
    const { i18n } = useCoreContext();

    const validator: Validator = new Validator(mbwayValidationRules);

    const [errors, setErrors] = useState(({} as any) as MBWayErrorsObject);
    const [valid, setValid] = useState(({} as any) as MBWayValidObject);
    const [data, setData] = useState(({ ...props.data } as any) as MBWayDataObject);

    const getIsValidEmail = (): boolean => validator.validate('email', 'blur')(data['email']).isValid;
    const getIsValidPhoneNumber = (): boolean => validator.validate('phoneNumber', 'blur')(data['phoneNumber']).isValid;

    this.showValidation = (): void => {
        setErrors({ ...errors, email: !getIsValidEmail(), phoneNumber: !getIsValidPhoneNumber() });
    };

    const handleEventFor = (key, type): RtnTypeFnWithEvent => (e: Event): void => {
        e.preventDefault();

        const val: string = (e.target as HTMLInputElement).value;

        const { value, isValid }: ValidationObj = validator.validate(key, type)(val);

        if (type === 'input') {
            setData({ ...data, [key]: value });
            setErrors({ ...errors, [key]: false });
        }

        if (type === 'blur') {
            // Length check, below, avoids bug where field, if in error state and then cleared, goes back to being in error state when it loses focus
            // If field is empty it can never be in error - else take the opposite of the isValid value
            const isInError: boolean = value.length === 0 ? false : !isValid;
            setErrors({ ...errors, [key]: isInError });
        }

        setValid({ ...valid, [key]: isValid });
    };

    useEffect(() => {
        // If data has been passed - validate
        if (data.email || data.phoneNumber) {
            setValid({ ...valid, email: getIsValidEmail(), phoneNumber: getIsValidPhoneNumber() });
        }
    }, []);

    // Run when state.data, -errors or -valid change
    useEffect(() => {
        props.onChange({ data, isValid: valid.email && valid.phoneNumber }, this);
    }, [data, valid, errors]);

    return (
        <div className="adyen-checkout__ach">
            <Field
                errorMessage={!!errors.email && i18n.get('shopperEmail.invalid')}
                label={i18n.get('shopperEmail')}
                classNameModifiers={['shopperEmail']}
                isValid={valid.email}
            >
                {renderFormField('emailAddress', {
                    value: data.email,
                    name: 'shopperEmail',
                    classNameModifiers: ['large'],
                    placeholder: props.placeholders.shopperEmail,
                    spellcheck: false,
                    required: true,
                    autocorrect: 'off',
                    onInput: handleEventFor('email', 'input'),
                    onChange: handleEventFor('email', 'blur')
                })}
            </Field>
            <Field
                errorMessage={!!errors.phoneNumber && i18n.get('telephoneNumber.invalid')}
                label={i18n.get('telephoneNumber')}
                className={classNames({
                    'adyen-checkout__input--phone-number': true
                })}
                isValid={valid.phoneNumber}
                // Fixes bug where shopper enters invalid chars - because these get automatically removed, change event does NOT fire
                onFieldBlur={handleEventFor('phoneNumber', 'blur')}
            >
                {renderFormField('tel', {
                    value: data.phoneNumber,
                    className: `adyen-checkout__pm__phoneNumber__input ${styles['adyen-checkout__input']}`,
                    placeholder: props.placeholders.telephoneNumber,
                    required: true,
                    autoCorrect: 'off',
                    onInput: handleEventFor('phoneNumber', 'input')
                    // onChange: handleEventFor('phoneNumber', 'blur')
                })}
            </Field>
            {props.showPayButton && props.payButton({ status: 'ready', label: i18n.get('confirmPurchase') })}
        </div>
    );
}

MBWayInput.defaultProps = {
    placeholders: { shopperEmail: 'shopper@domain.com', telephoneNumber: '+351 932 123 456' }
};

export default MBWayInput;
