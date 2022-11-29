import { h } from 'preact';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ExpirationDateProps } from './types';
import styles from '../CardInput.module.scss';
import DataSfSpan from './DataSfSpan';
import {
    DATE_POLICY_HIDDEN,
    DATE_POLICY_OPTIONAL,
    DATE_POLICY_REQUIRED,
    ENCRYPTED_EXPIRY_DATE
} from '../../../../internal/SecuredFields/lib/configuration/constants';

export default function ExpirationDate(props: ExpirationDateProps) {
    const { label, focused, filled, onFocusField, className = '', error = '', isValid = false, expiryDatePolicy = DATE_POLICY_REQUIRED } = props;
    const {
        i18n,
        commonProps: { isCollatingErrors }
    } = useCoreContext();

    const fieldClassnames = classNames(className, {
        'adyen-checkout__field__exp-date': true,
        [styles['adyen-checkout__card__exp-date__input--hidden']]: expiryDatePolicy === DATE_POLICY_HIDDEN,
        'adyen-checkout__field__exp-date--optional': expiryDatePolicy === DATE_POLICY_OPTIONAL
    });

    const fieldLabel = expiryDatePolicy !== DATE_POLICY_OPTIONAL ? label : `${label} ${i18n.get('field.title.optional')}`;

    return (
        <Field
            label={fieldLabel}
            classNameModifiers={['expiryDate']}
            className={fieldClassnames}
            focused={focused}
            filled={filled}
            onFocusField={() => onFocusField(ENCRYPTED_EXPIRY_DATE)}
            errorMessage={error}
            isValid={isValid}
            dir={'ltr'}
            name={'encryptedExpiryDate'}
            isCollatingErrors={isCollatingErrors}
            i18n={i18n}
        >
            <DataSfSpan
                encryptedFieldType={ENCRYPTED_EXPIRY_DATE}
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
