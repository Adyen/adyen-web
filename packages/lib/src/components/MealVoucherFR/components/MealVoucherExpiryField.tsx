import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import Field from '../../internal/FormFields/Field';
import { h } from 'preact';
import { GiftcardFieldProps } from '../../Giftcard/components/types';

export const MealVoucherExpiryField = ({ i18n, sfpState, focusedElement, setFocusOn }: GiftcardFieldProps) => {
    return (
        <Field
            label={i18n.get('creditCard.expiryDateField.title')}
            classNameModifiers={['expireDate', '50']}
            errorMessage={sfpState.errors.encryptedExpiryDate && i18n.get(sfpState.errors.encryptedExpiryDate)}
            focused={focusedElement === 'encryptedExpiryDate'}
            onFocusField={() => setFocusOn('encryptedExpiryDate')}
            dir={'ltr'}
            name={'encryptedExpiryDate'}
            contextVisibleToScreenReader={false}
        >
            <DataSfSpan
                encryptedFieldType={'encryptedExpiryDate'}
                className={classNames('adyen-checkout__input', 'adyen-checkout__input--small', 'adyen-checkout__card__exp-date__input', {
                    'adyen-checkout__input--error': sfpState.errors.encryptedExpiryDate,
                    'adyen-checkout__input--focus': focusedElement === 'encryptedExpiryDate',
                    'adyen-checkout__input--valid': !!sfpState.valid.encryptedExpiryMonth && !!sfpState.valid.encryptedExpiryYear
                })}
            />
        </Field>
    );
};
