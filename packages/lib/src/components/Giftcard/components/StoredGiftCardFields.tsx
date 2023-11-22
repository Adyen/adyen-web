import { h } from 'preact';
import { GiftcardPinField } from './GiftcardPinField';
import { GiftcardFieldsProps } from './types';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../../internal/FormFields/Field';
import InputText from '../../internal/FormFields/InputText';

interface StoredGiftCardFieldsProps extends GiftcardFieldsProps {
    expiryMonth: number;
    expiryYear: number;
}

export const StoredGiftCardFields = (props: Readonly<StoredGiftCardFieldsProps>) => {
    const { pinRequired, expiryMonth, expiryYear } = props;
    const { i18n } = useCoreContext();
    // const storedCardDescription = i18n.get('creditCard.storedCard.description.ariaLabel').replace('%@', lastFour);
    // const storedCardDescriptionSuffix =
    //   expiryMonth && expiryYear ? ` ${i18n.get('creditCard.expiryDateField.title')} ${expiryMonth}/${expiryYear}` : '';
    // const ariaLabel = `${storedCardDescription}${storedCardDescriptionSuffix}`;

    // const getError = (errors, fieldType) => {
    //     const errorMessage = errors[fieldType] ? i18n.get(errors[fieldType]) : null;
    //     return errorMessage;
    // };

    return (
        // TODO missing aria-label
        <div className="adyen-checkout__card__form adyen-checkout__card__form--oneClick">
            <div className="adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper">
                {expiryMonth && expiryYear && (
                    <Field
                        label={i18n.get('creditCard.expiryDateField.title')}
                        className="adyen-checkout__field--50"
                        classNameModifiers={['storedCard']}
                        name={'expiryDateField'}
                        disabled
                    >
                        <InputText
                            name={'expiryDateField'}
                            className={'adyen-checkout__input adyen-checkout__input--disabled adyen-checkout__card__exp-date__input--oneclick'}
                            value={`${expiryMonth} / ${expiryYear}`}
                            readonly={true}
                            disabled={true}
                            dir={'ltr'}
                        />
                    </Field>
                )}
                {pinRequired && <GiftcardPinField {...props} classNameModifiers={['50']} />}
            </div>
        </div>
    );
};
