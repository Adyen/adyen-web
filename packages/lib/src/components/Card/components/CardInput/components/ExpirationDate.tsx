import { h } from 'preact';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ExpirationDateProps } from './types';
import styles from '../CardInput.module.scss';
import { DATA_ENCRYPTED_FIELD_ATTR } from '../../../../internal/SecuredFields/lib/configuration/constants';
import DataSfSpan from './DataSfSpan';

export default function ExpirationDate(props: ExpirationDateProps) {
    const { label, focused, filled, onFocusField, className = '', error = '', isValid = false, hideDateForBrand = false } = props;
    const { i18n } = useCoreContext();

    const fieldClassnames = classNames(className, {
        [styles['adyen-checkout__card__exp-date__input--hidden']]: hideDateForBrand
    });

    const opts = { [DATA_ENCRYPTED_FIELD_ATTR]: 'encryptedExpiryDate' };

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
            name={'encryptedExpiryDate'}
        >
            <DataSfSpan
                {...opts}
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
