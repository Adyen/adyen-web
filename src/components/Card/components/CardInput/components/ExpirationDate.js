import classNames from 'classnames';
import { h } from 'preact';
import Field from '~/components/internal/FormFields/Field';
import styles from '../CardInput.module.scss';

const ExpirationDate = ({ label, focused, filled, onFocusField, className = '', error = false, isValid = false }, { i18n }) => (
    <Field
        label={label}
        classNameModifiers={['expiryDate']}
        className={className}
        focused={focused}
        filled={filled}
        onFocusField={() => onFocusField('encryptedExpiryDate')}
        errorMessage={error && i18n.get('creditCard.expiryDateField.invalid')}
        isValid={isValid}
    >
        <span
            data-cse="encryptedExpiryDate"
            className={classNames({
                'adyen-checkout__input': true,
                'adyen-checkout__input--small': true,
                'adyen-checkout__card__exp-date__input': true,
                [styles['adyen-checkout__input']]: true,
                'adyen-checkout__input--error': error,
                'adyen-checkout__input--focus': focused,
                'adyen-checkout__input--valid': isValid
            })}
        />
    </Field>
);

export default ExpirationDate;
