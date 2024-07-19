import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import Field from '../../internal/FormFields/Field';
import { h } from 'preact';
import { GiftcardFieldProps } from './types';
import { alternativeLabelContent } from '../../Card/components/CardInput/components/FieldLabelAlternative';

export const GiftcardPinField = ({
    i18n,
    classNameModifiers,
    sfpState,
    focusedElement,
    setFocusOn,
    label = i18n.get('creditCard.pin.label')
}: GiftcardFieldProps) => {
    return (
        <Field
            label={label}
            classNameModifiers={['pin', ...classNameModifiers]}
            errorMessage={sfpState.errors.encryptedSecurityCode && i18n.get(sfpState.errors.encryptedSecurityCode)}
            focused={focusedElement === 'encryptedSecurityCode'}
            onFocusField={() => setFocusOn('encryptedSecurityCode')}
            dir={'ltr'}
            name={'encryptedSecurityCode'}
            contextVisibleToScreenReader={false}
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
        >
            <DataSfSpan
                encryptedFieldType="encryptedSecurityCode"
                data-info='{"length":"3-10", "maskInterval": 0}'
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    'adyen-checkout__card__cvc__input': true,
                    'adyen-checkout__input--error': sfpState.errors.encryptedSecurityCode,
                    'adyen-checkout__input--focus': focusedElement === 'encryptedSecurityCode'
                })}
            />
        </Field>
    );
};
