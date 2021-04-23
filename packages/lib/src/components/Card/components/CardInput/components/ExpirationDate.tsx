import { h } from 'preact';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ExpirationDateProps } from './types';
import styles from '../CardInput.module.scss';

export default function ExpirationDate(props: ExpirationDateProps) {
    const { label, focused, filled, onFocusField, className = '', error = '', isValid = false, hideDateForBrand = false } = props;
    const { i18n } = useCoreContext();

    const fieldClassnames = classNames(className, {
        [styles['adyen-checkout__card__exp-date__input--hidden']]: hideDateForBrand
    });

    return (
        <Field
            label={label}
            classNameModifiers={['expiryDate']}
            className={fieldClassnames}
            focused={focused}
            filled={filled}
            onFocusField={() => onFocusField('encryptedExpiryDate')}
            errorMessage={error && i18n.get(error)}
            isValid={isValid}
            dir={'ltr'}
        >
            <span
                data-cse="encryptedExpiryDate"
                className={classNames(
                    'adyen-checkout__input',
                    'adyen-checkout__input--small',
                    'adyen-checkout__card__exp-date__input',
                    [styles['adyen-checkout__input']],
                    {
                        'adyen-checkout__input--error': error,
                        'adyen-checkout__input--focus': focused,
                        'adyen-checkout__input--valid': isValid
                    }
                )}
            />
        </Field>
    );
}

// export default ExpirationDate;
