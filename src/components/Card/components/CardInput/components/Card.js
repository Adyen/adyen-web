import { h } from 'preact';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import CardNumber from './CardNumber';
//import Field from '~/components/internal/FormFields/Field';
import cx from 'classnames';
import DualBrandingIcon from '~/components/Card/components/CardInput/components/DualBrandingIcon';

const Card = (
    {
        brand,
        focusedElement,
        hasCVC,
        onFocusField,
        hideCVCForBrand,
        errors,
        valid,
        cvcRequired,
        loadingContext,
        dualBrandingElements,
        dualBrandingChangeHandler,
        dualBrandingSelected,
        ...props
    },
    { i18n }
) => (
    <div className="adyen-checkout__card__form">
        <CardNumber
            brand={brand}
            error={!!errors.encryptedCardNumber}
            focused={focusedElement === 'encryptedCardNumber'}
            isValid={!!valid.encryptedCardNumber}
            label={i18n.get('creditCard.numberField.title')}
            onFocusField={onFocusField}
            filled={!!errors.encryptedCardNumber || !!valid.encryptedCardNumber}
            loadingContext={loadingContext}
            showBrandIcon={props.showBrandIcon}
            dualBrandingElements={dualBrandingElements}
            dualBrandingChangeHandler={dualBrandingChangeHandler}
            dualBrandingSelected={dualBrandingSelected}
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

export default Card;
