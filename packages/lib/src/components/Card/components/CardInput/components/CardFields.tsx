import { h } from 'preact';
import CardNumber from './CardNumber';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CardFieldsProps } from './types';
import classNames from 'classnames';
import styles from '../CardInput.module.scss';
import {
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
    showBrandsInCard,
    valid
}: CardFieldsProps) {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__card__form">
            <CardNumber
                brand={brand}
                brandsConfiguration={brandsConfiguration}
                error={errors.encryptedCardNumber}
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

            {showBrandsInCard && <AvailableBrands activeBrand={brand} brands={brandsIcons} />}

            <div
                className={classNames('adyen-checkout__card__exp-cvc adyen-checkout__field-wrapper', {
                    [styles['adyen-checkout__card__exp-cvc__exp-date__input--hidden']]: expiryDatePolicy === DATE_POLICY_HIDDEN
                })}
            >
                <ExpirationDate
                    error={errors.encryptedExpiryDate || errors.encryptedExpiryYear || errors.encryptedExpiryMonth}
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
                        error={errors.encryptedSecurityCode}
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
