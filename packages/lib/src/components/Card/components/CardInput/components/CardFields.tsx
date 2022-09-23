import { h } from 'preact';
import CardNumber from './CardNumber';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CardFieldsProps } from './types';
import classNames from 'classnames';
import styles from '../CardInput.module.scss';
import {
    BRAND_ICON_UI_EXCLUSION_LIST,
    DATE_POLICY_HIDDEN,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE
} from '../../../../internal/SecuredFields/lib/configuration/constants';
import AvailableBrands from './AvailableBrands';

export default function CardFields({
    brand,
    brandsIcons,
    brandsConfiguration,
    dualBrandingElements,
    dualBrandingChangeHandler,
    dualBrandingSelected,
    errors,
    focusedElement,
    hasCVC,
    cvcPolicy,
    expiryDatePolicy,
    onFocusField,
    showBrandIcon,
    showBrandsUnderCardNumber,
    valid
}: CardFieldsProps) {
    const { i18n } = useCoreContext();

    // Prepend a label to the errorMessage so that it matches the error read by the screenreader
    const getErrorWithLabel = (errors, fieldType) => {
        let errorMessage = errors[fieldType] ? i18n.get(errors[fieldType]) : null;

        if (errorMessage) {
            const label = i18n.get(`creditCard.${fieldType}.aria.label`);
            errorMessage = `${label}: ${errorMessage}`;
        }

        return errorMessage;
    };

    // A set of brands filtered to exclude those that can never appear in the UI
    const allowedBrands = brandsIcons.filter(brandsIcons => !BRAND_ICON_UI_EXCLUSION_LIST?.includes(brandsIcons.name));

    return (
        <div className="adyen-checkout__card__form">
            <CardNumber
                brand={brand}
                brandsConfiguration={brandsConfiguration}
                error={getErrorWithLabel(errors, ENCRYPTED_CARD_NUMBER)}
                focused={focusedElement === ENCRYPTED_CARD_NUMBER}
                isValid={!!valid.encryptedCardNumber}
                label={i18n.get('creditCard.numberField.title')}
                onFocusField={onFocusField}
                filled={!!errors.encryptedCardNumber || !!valid.encryptedCardNumber}
                showBrandIcon={showBrandIcon}
                dualBrandingElements={dualBrandingElements}
                dualBrandingChangeHandler={dualBrandingChangeHandler}
                dualBrandingSelected={dualBrandingSelected}
            />

            {showBrandsUnderCardNumber && <AvailableBrands activeBrand={brand} brands={allowedBrands} />}

            <div
                className={classNames('adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper', {
                    [styles['adyen-checkout__card__exp-cvc__exp-date__input--hidden']]: expiryDatePolicy === DATE_POLICY_HIDDEN
                })}
            >
                <ExpirationDate
                    error={getErrorWithLabel(errors, ENCRYPTED_EXPIRY_DATE)}
                    focused={focusedElement === ENCRYPTED_EXPIRY_DATE}
                    isValid={!!valid.encryptedExpiryMonth && !!valid.encryptedExpiryYear}
                    filled={!!errors.encryptedExpiryDate || !!valid.encryptedExpiryYear}
                    label={i18n.get('creditCard.expiryDateField.title')}
                    onFocusField={onFocusField}
                    className={'adyen-checkout__field--50'}
                    expiryDatePolicy={expiryDatePolicy}
                />

                {hasCVC && (
                    <CVC
                        error={getErrorWithLabel(errors, ENCRYPTED_SECURITY_CODE)}
                        focused={focusedElement === ENCRYPTED_SECURITY_CODE}
                        cvcPolicy={cvcPolicy}
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
