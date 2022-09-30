import { h } from 'preact';
import CVC from './CVC';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { StoredCardFieldsProps } from './types';
import { ENCRYPTED_SECURITY_CODE } from '../../../../internal/SecuredFields/lib/configuration/constants';

export default function StoredCardFields({
    brand,
    hasCVC,
    onFocusField,
    errors,
    valid,
    cvcPolicy,
    focusedElement,
    lastFour,
    expiryMonth,
    expiryYear
}: StoredCardFieldsProps) {
    const { i18n } = useCoreContext();
    const storedCardDescription = i18n.get('creditCard.storedCard.description.ariaLabel').replace('%@', lastFour);
    const ariaLabel = `${storedCardDescription} ${i18n.get('creditCard.expiryDateField.title')} ${expiryMonth}/${expiryYear}`;

    const getErrorWithLabel = (errors, fieldType) => {
        let errorMessage = errors[fieldType] ? i18n.get(errors[fieldType]) : null;

        if (errorMessage) {
            const label = i18n.get(`creditCard.${fieldType}.aria.label`);
            errorMessage = `${label}: ${errorMessage}`;
        }

        return errorMessage;
    };

    return (
        <div className="adyen-checkout__card__form adyen-checkout__card__form--oneClick" aria-label={ariaLabel}>
            <div className="adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper">
                <Field
                    label={i18n.get('creditCard.expiryDateField.title')}
                    className="adyen-checkout__field--50"
                    classNameModifiers={['storedCard']}
                    disabled
                >
                    <div
                        className="adyen-checkout__input adyen-checkout__input--disabled adyen-checkout__card__exp-date__input--oneclick"
                        dir={'ltr'}
                    >
                        {expiryMonth} / {expiryYear}
                    </div>
                </Field>

                {hasCVC && (
                    <CVC
                        cvcPolicy={cvcPolicy}
                        error={getErrorWithLabel(errors, ENCRYPTED_SECURITY_CODE)}
                        focused={focusedElement === 'encryptedSecurityCode'}
                        filled={!!valid.encryptedSecurityCode || !!errors.encryptedSecurityCode}
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
}
