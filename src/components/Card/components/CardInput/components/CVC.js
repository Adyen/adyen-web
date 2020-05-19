import classNames from 'classnames';
import { h } from 'preact';
import Field from '~/components/internal/FormFields/Field';
import styles from '../CardInput.module.scss';
import CVCHint from './CVCHint';

const CVC = (
    {
        label,
        onFocusField = () => {},
        error = false,
        className = '',
        classNameModifiers = [],
        focused,
        filled,
        isValid,
        frontCVC = false,
        hideCVCForBrand = false,
        cvcRequired = true
    },
    { i18n }
) => {
    const fieldClassnames = classNames(className, {
        'adyen-checkout__field__cvc': true,
        [styles['adyen-checkout__card__cvc__input--hidden']]: hideCVCForBrand,
        'adyen-checkout__field__cvc--optional': !cvcRequired
    });

    const cvcClassnames = classNames({
        'adyen-checkout__input': true,
        'adyen-checkout__input--small': true,
        'adyen-checkout__card__cvc__input': true,
        'adyen-checkout__input--error': error,
        'adyen-checkout__input--focus': focused,
        'adyen-checkout__input--valid': isValid,
        [styles['adyen-checkout__input']]: true
    });

    const fieldLabel = cvcRequired ? label : i18n.get('creditCard.cvcField.title.optional');

    return (
        <Field
            label={fieldLabel}
            focused={focused}
            filled={filled}
            classNameModifiers={[...classNameModifiers, 'securityCode']}
            onFocusField={() => onFocusField('encryptedSecurityCode')}
            className={fieldClassnames}
            errorMessage={!!error && i18n.get('creditCard.oneClickVerification.invalidInput.title')}
            isValid={isValid}
        >
            <span className={cvcClassnames} data-cse="encryptedSecurityCode" />

            <CVCHint frontCVC={frontCVC} />
        </Field>
    );
};

export default CVC;
