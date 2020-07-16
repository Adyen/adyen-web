import { h } from 'preact';
import CardNumber from './CardNumber';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CardFieldsProps } from './types';

export default function CardFields(props: CardFieldsProps) {
    const { brand, focusedElement, hasCVC, onFocusField, hideCVCForBrand, errors, valid, cvcRequired, showBrandIcon } = props;
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__card__form">
            <CardNumber
                brand={brand}
                error={!!errors.encryptedCardNumber}
                focused={focusedElement === 'encryptedCardNumber'}
                isValid={!!valid.encryptedCardNumber}
                label={i18n.get('creditCard.numberField.title')}
                onFocusField={onFocusField}
                filled={!!errors.encryptedCardNumber || !!valid.encryptedCardNumber}
                showBrandIcon={showBrandIcon}
            />

            <div className="adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper">
                <ExpirationDate
                    error={!!errors.encryptedExpiryDate || !!errors.encryptedExpiryYear || !!errors.encryptedExpiryMonth}
                    focused={focusedElement === 'encryptedExpiryDate'}
                    isValid={!!valid.encryptedExpiryYear && !!valid.encryptedExpiryYear}
                    filled={!!errors.encryptedExpiryDate || !!valid.encryptedExpiryYear}
                    label={i18n.get('creditCard.expiryDateField.title')}
                    onFocusField={onFocusField}
                    className={'adyen-checkout__field--50'}
                />

                {hasCVC && (
                    <CVC
                        cvcRequired={cvcRequired}
                        error={!!errors.encryptedSecurityCode}
                        focused={focusedElement === 'encryptedSecurityCode'}
                        hideCVCForBrand={hideCVCForBrand}
                        isValid={!!valid.encryptedSecurityCode}
                        filled={!!errors.encryptedSecurityCode || !!valid.encryptedSecurityCode}
                        label={i18n.get('creditCard.cvcField.title')}
                        onFocusField={onFocusField}
                        className={'adyen-checkout__field--50'}
                        frontCVC={brand === 'amex'}
                    />
                )}
            </div>
        </div>
    );
}
