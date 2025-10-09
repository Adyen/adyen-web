import { h } from 'preact';
import CVC from './CVC';
import Field from '../../../../internal/FormFields/Field';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { StoredCardFieldsProps } from './types';
import { ENCRYPTED_SECURITY_CODE } from '../../../../internal/SecuredFields/lib/constants';
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
    expiryYear,
    showContextualElement
}: StoredCardFieldsProps) {
    const { i18n } = useCoreContext();
    const storedCardDescription = i18n.get('creditCard.storedCard.description.ariaLabel').replace('%@', lastFour);
    const storedCardDescriptionSuffix = expiryMonth && expiryYear ? ` ${i18n.get('creditCard.expiryDate.label')} ${expiryMonth}/${expiryYear}` : '';
    const ariaLabel = `${storedCardDescription}${storedCardDescriptionSuffix}`;
    const isAmex = brand === 'amex';
    const cvcContextualText = isAmex
        ? i18n.get('creditCard.securityCode.contextualText.4digits')
        : i18n.get('creditCard.securityCode.contextualText.3digits');

    const getError = (errors, fieldType) => {
        return errors[fieldType] ? i18n.get(errors[fieldType]) : null;
    };

    return (
        <div className="adyen-checkout__card__form adyen-checkout__card__form--oneClick" aria-label={ariaLabel}>
            <div className="adyen-checkout__card__exp-cvc adyen-checkout__fieldset__fields">
                {expiryMonth && expiryYear && (
                    <Field
                        label={i18n.get('creditCard.expiryDate.label')}
                        classNameModifiers={['col-50', 'storedCard']}
                        name={'expiryDateField'}
                        disabled
                    >
                        <InputText
                            name={'expiryDateField'}
                            className={'adyen-checkout__input adyen-checkout__input--disabled adyen-checkout__card__exp-date__input--oneclick'}
                            value={`${expiryMonth} / ${expiryYear}`}
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
                        label={i18n.get('creditCard.securityCode.label')}
                        onFocusField={onFocusField}
                        classNameModifiers={[...(expiryMonth && expiryYear ? ['col-50', 'storedCard'] : ['storedCard'])]}
                        frontCVC={isAmex}
                        showContextualElement={showContextualElement}
                        contextualText={cvcContextualText}
                    />
                )}
            </div>
        </div>
    );
}
