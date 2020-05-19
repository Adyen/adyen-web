import { h } from 'preact';
import CVC from './CVC';
import Field from '~/components/internal/FormFields/Field';

const OneClickCardInput = ({ brand, hasCVC, onFocusField, errors, valid, ...props }, { i18n }) => {
    // TODO create a translation key for "stored card ends in"
    const ariaLabel = `stored card ends in ${props.lastFour}
        ${i18n.get('creditCard.expiryDateField.title')} ${props.expiryMonth}/${props.expiryYear}`;

    return (
        <div className="adyen-checkout__card__form adyen-checkout__card__form--oneClick" aria-label={ariaLabel}>
            <div className="adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper">
                <Field
                    label={i18n.get('creditCard.expiryDateField.title')}
                    className="adyen-checkout__field--50"
                    classNameModifiers={['storedCard']}
                    disabled
                >
                    <div className="adyen-checkout__input adyen-checkout__input--disabled adyen-checkout__card__exp-date__input--oneclick">
                        {props.expiryMonth} / {props.expiryYear}
                    </div>
                </Field>

                {hasCVC && (
                    <CVC
                        cvcRequired={props.cvcRequired}
                        error={!!errors.encryptedSecurityCode}
                        focused={props.focusedElement === 'encryptedSecurityCode'}
                        filled={!!valid.encryptedSecurityCode || !!errors.encryptedSecurityCode}
                        hideCVCForBrand={props.hideCVCForBrand}
                        isValid={!!valid.encryptedSecurityCode}
                        label={i18n.get('creditCard.cvcField.title')}
                        onFocusField={onFocusField}
                        className={'adyen-checkout__field--50'}
                        classNameModifiers={['storedCard']}
                        frontCVC={brand === 'amex'}
                    />
                )}
            </div>
        </div>
    );
};

export default OneClickCardInput;
