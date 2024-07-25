import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import Field from '../../internal/FormFields/Field';
import { h } from 'preact';
import { GiftcardFieldProps } from './types';
import { alternativeLabelContent } from '../../Card/components/CardInput/components/FieldLabelAlternative';

export const GiftcardNumberField = ({ i18n, classNameModifiers, sfpState, getCardErrorMessage, focusedElement, setFocusOn }: GiftcardFieldProps) => {
    return (
        <Field
            label={i18n.get('giftcard.cardNumber.label')}
            classNameModifiers={['number', ...classNameModifiers]}
            errorMessage={getCardErrorMessage(sfpState)}
            focused={focusedElement === 'encryptedCardNumber'}
            onFocusField={() => setFocusOn('encryptedCardNumber')}
            dir={'ltr'}
            name={'encryptedCardNumber'}
            contextVisibleToScreenReader={false}
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
        >
            <DataSfSpan
                encryptedFieldType="encryptedCardNumber"
                data-info='{"length":"15-32", "maskInterval":4}'
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    'adyen-checkout__card__cardNumber__input': true,
                    'adyen-checkout__input--error': getCardErrorMessage(sfpState),
                    'adyen-checkout__input--focus': focusedElement === 'encryptedCardNumber'
                })}
            />
        </Field>
    );
};
