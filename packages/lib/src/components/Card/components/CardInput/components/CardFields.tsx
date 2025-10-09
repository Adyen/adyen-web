import { h } from 'preact';
import CardNumber from './CardNumber';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { CardFieldsProps } from './types';
import classNames from 'classnames';
import {
    BRAND_ICON_UI_EXCLUSION_LIST,
    DATE_POLICY_HIDDEN,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE
} from '../../../../internal/SecuredFields/lib/constants';
import AvailableBrands from './AvailableBrands';

export default function CardFields({
    brand,
    brandsIcons,
    brandsConfiguration,
    dualBrandingElements,
    errors,
    focusedElement,
    hasCVC,
    cvcPolicy,
    expiryDatePolicy,
    onFocusField,
    showBrandIcon,
    valid,
    showContextualElement
}: CardFieldsProps) {
    const { i18n } = useCoreContext();

    const getError = (errors, fieldType) => {
        return errors[fieldType] ? i18n.get(errors[fieldType]) : null;
    };

    // A set of brands filtered to exclude those that can never appear in the UI
    const allowedBrands = brandsIcons?.filter(brandsIcons => !BRAND_ICON_UI_EXCLUSION_LIST?.includes(brandsIcons.name));
    const isAmex = brand === 'amex';
    const cvcContextualText = isAmex
        ? i18n.get('creditCard.securityCode.contextualText.4digits')
        : i18n.get('creditCard.securityCode.contextualText.3digits');

    return (
        <div className="adyen-checkout__card__form">
            <CardNumber
                brand={brand}
                brandsConfiguration={brandsConfiguration}
                error={getError(errors, ENCRYPTED_CARD_NUMBER)}
                focused={focusedElement === ENCRYPTED_CARD_NUMBER}
                isValid={!!valid.encryptedCardNumber}
                label={i18n.get('creditCard.cardNumber.label')}
                onFocusField={onFocusField}
                filled={!!errors.encryptedCardNumber || !!valid.encryptedCardNumber}
                showBrandIcon={showBrandIcon}
                dualBrandingElements={dualBrandingElements}
            />

            <AvailableBrands activeBrand={brand} brands={allowedBrands} />

            <div
                className={classNames('adyen-checkout__card__exp-cvc adyen-checkout__fieldset__fields', {
                    'adyen-checkout__card__exp-cvc__exp-date__input--hidden': expiryDatePolicy === DATE_POLICY_HIDDEN
                })}
            >
                <ExpirationDate
                    classNameModifiers={['col-50']}
                    error={getError(errors, ENCRYPTED_EXPIRY_DATE)}
                    focused={focusedElement === ENCRYPTED_EXPIRY_DATE}
                    isValid={!!valid.encryptedExpiryMonth && !!valid.encryptedExpiryYear}
                    filled={!!errors.encryptedExpiryDate || !!valid.encryptedExpiryYear}
                    label={i18n.get('creditCard.expiryDate.label')}
                    onFocusField={onFocusField}
                    expiryDatePolicy={expiryDatePolicy}
                    showContextualElement={showContextualElement}
                    contextualText={i18n.get('creditCard.expiryDate.contextualText')}
                />

                {hasCVC && (
                    <CVC
                        classNameModifiers={['col-50']}
                        error={getError(errors, ENCRYPTED_SECURITY_CODE)}
                        focused={focusedElement === ENCRYPTED_SECURITY_CODE}
                        cvcPolicy={cvcPolicy}
                        isValid={!!valid.encryptedSecurityCode}
                        filled={!!errors.encryptedSecurityCode || !!valid.encryptedSecurityCode}
                        label={i18n.get('creditCard.securityCode.label')}
                        onFocusField={onFocusField}
                        frontCVC={isAmex}
                        showContextualElement={showContextualElement}
                        contextualText={cvcContextualText}
                    />
                )}
            </div>
        </div>
    );
}
