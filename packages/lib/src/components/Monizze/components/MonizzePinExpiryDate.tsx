import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import styles from '../../Card/components/CardInput/CardInput.module.scss';
import Field from '../../internal/FormFields/Field';
import { h } from 'preact';
import { GiftcardFieldProps } from '../../Giftcard/components/types';

export const MonizzePinExpiryDate = ({ i18n, sfpState, focusedElement, setFocusOn, classNameModifiers }: GiftcardFieldProps) => {
    return (
        <Field
            label={i18n.get('creditCard.expiryDateField.title')}
            classNameModifiers={['encryptedSecurityCode', ...classNameModifiers]}
            errorMessage={sfpState.errors.encryptedSecurityCode && i18n.get(sfpState.errors.encryptedExpiryDate)}
            focused={focusedElement === 'encryptedSecurityCode'}
            onFocusField={() => setFocusOn('encryptedSecurityCode')}
            dir={'ltr'}
            name={'encryptedSecurityCode'}
            errorVisibleToScreenReader={false}
        >
            <DataSfSpan
                encryptedFieldType={'encryptedSecurityCode'}
                data-info='{"length":"4", "maskInterval": 0}'
                className={classNames(
                    'adyen-checkout__input',
                    'adyen-checkout__input--small',
                    'adyen-checkout__card__exp-date__input',
                    [styles['adyen-checkout__input']],
                    {
                        'adyen-checkout__input--error': sfpState.errors.encryptedSecurityCode,
                        'adyen-checkout__input--focus': focusedElement === 'encryptedSecurityCode',
                        'adyen-checkout__input--valid': !!sfpState.valid.encryptedSecurityCode
                    }
                )}
            />
        </Field>
    );
};
