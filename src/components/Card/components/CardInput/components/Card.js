import { h } from 'preact';
import CVC from './CVC';
import ExpirationDate from './ExpirationDate';
import CardNumber from './CardNumber';
//import Field from '~/components/internal/FormFields/Field';
import cx from 'classnames';

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
        />

        {/*{dualBranding && (*/}
        {/*    <Field label={i18n.get('Select variation')} classNameModifiers={['txVariantAdditionalInfo']}>*/}
        {/*        <button*/}
        {/*            type="button"*/}
        {/*            className="adyen-checkout__button adyen-checkout__button--dual-brand-selector"*/}
        {/*            aria-controls="encryptedCardNumber"*/}
        {/*        >*/}
        {/*            {dualBranding[0].name}*/}
        {/*        </button>*/}
        {/*        <button*/}
        {/*            type="button"*/}
        {/*            className="adyen-checkout__button adyen-checkout__button--dual-brand-selector"*/}
        {/*            aria-controls="encryptedCardNumber"*/}
        {/*        >*/}
        {/*            {dualBranding[1].name}*/}
        {/*        </button>*/}
        {/*    </Field>*/}
        {/*)}*/}

        {dualBrandingElements && (
            <div className="adyen-checkout__card__dual-branding">
                <span className="adyen-checkout__label__text">{i18n.get('creditCard.dualBrandSelector.label')}</span>
                <span className="adyen-checkout__card__dual-branding__buttons">
                    <button
                        type="button"
                        className={cx([
                            'adyen-checkout__button',
                            'adyen-checkout__button__dual-brand-selector',
                            'adyen-checkout__label__text',
                            {
                                'adyen-checkout__button__dual-brand-selector--selected': dualBrandingSelected === dualBrandingElements[0].id
                            }
                        ])}
                        aria-controls="encryptedCardNumber"
                        onClick={dualBrandingChangeHandler}
                        data-value={dualBrandingElements[0].id}
                    >
                        {dualBrandingElements[0].name}
                    </button>
                    <button
                        type="button"
                        className={cx([
                            'adyen-checkout__button',
                            'adyen-checkout__button__dual-brand-selector',
                            'adyen-checkout__label__text',
                            {
                                'adyen-checkout__button__dual-brand-selector--selected': dualBrandingSelected === dualBrandingElements[1].id
                            }
                        ])}
                        aria-controls="encryptedCardNumber"
                        onClick={dualBrandingChangeHandler}
                        data-value={dualBrandingElements[1].id}
                    >
                        {dualBrandingElements[1].name}
                    </button>
                </span>
            </div>
        )}

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
