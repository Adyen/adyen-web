import { h } from 'preact';
import CVC from './CVC';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { StoredCardFieldsProps } from './types';
import { ENCRYPTED_SECURITY_CODE } from '../../../../internal/SecuredFields/lib/configuration/constants';
import InputText from '../../../../internal/FormFields/InputText';

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
    const storedCardDescriptionSuffix =
        expiryMonth && expiryYear ? ` ${i18n.get('creditCard.expiryDateField.title')} ${expiryMonth}/${expiryYear}` : '';
    const ariaLabel = `${storedCardDescription}${storedCardDescriptionSuffix}`;

    const getError = (errors, fieldType) => {
        const errorMessage = errors[fieldType] ? i18n.get(errors[fieldType]) : null;
        return errorMessage;
    };

    return (
        <div className="adyen-checkout__card__form adyen-checkout__card__form--oneClick" aria-label={ariaLabel}>
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

                {hasCVC && (
                    <CVC
                        cvcPolicy={cvcPolicy}
                        error={getError(errors, ENCRYPTED_SECURITY_CODE)}
                        focused={focusedElement === 'encryptedSecurityCode'}
                        filled={!!valid.encryptedSecurityCode || !!errors.encryptedSecurityCode}
                        isValid={!!valid.encryptedSecurityCode}
                        label={i18n.get('creditCard.cvcField.title')}
                        onFocusField={onFocusField}
                        {...(expiryMonth && expiryYear && { className: 'adyen-checkout__field--50' })}
                        classNameModifiers={['storedCard']}
                        frontCVC={brand === 'amex'}
                    />
                )}
            </div>
        </div>
    );
}
