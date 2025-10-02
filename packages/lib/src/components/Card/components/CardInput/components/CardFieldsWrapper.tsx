import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import CardFields from './CardFields';
import KCPAuthentication from './KCPAuthentication';
import SocialSecurityNumberBrazil from '../../../../internal/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
import StoreDetails from '../../../../internal/StoreDetails';
import Address from '../../../../internal/Address';
import CardHolderName from './CardHolderName';
import Installments from './Installments';
import DisclaimerMessage from '../../../../internal/DisclaimerMessage';
import RadioGroupExtended from '../../../../internal/FormFields/RadioGroupExtended';
import { mapDualBrandButtons, mustHandleDualBrandingAccordingToEURegulations } from '../utils';
import Fieldset from '../../../../internal/FormFields/Fieldset';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM } from '../../../constants';

export const CardFieldsWrapper = ({
    // vars created in CardInput:
    // base (shared)
    data,
    valid,
    errors,
    handleChangeFor,
    sfpState,
    setFocusOn,
    cvcPolicy,
    focusedElement,
    hasInstallments,
    handleInstallments,
    showAmountsInInstallments,
    // Card
    brandsIcons,
    formData,
    formErrors,
    formValid,
    expiryDatePolicy,
    dualBrandSelectElements,
    extensions,
    selectedBrandValue,
    // KCP
    showKCP,
    // SSN
    showBrazilianSSN,
    socialSecurityNumber,
    // Store details
    handleOnStoreDetails,
    // Address
    billingAddress,
    handleAddress,
    setAddressRef,
    partialAddressSchema,
    onAddressLookup,
    onAddressSelected,
    addressSearchDebounceMs,
    // For this comp (props passed through from CardInput)
    amount,
    billingAddressRequired,
    billingAddressRequiredFields,
    billingAddressAllowedCountries,
    billingAddressValidationRules = null,
    brandsConfiguration,
    showStoreDetailsCheckbox,
    hasCVC,
    hasHolderName,
    holderNameRequired,
    installmentOptions,
    placeholders,
    positionHolderNameOnTop,
    // For CardFields > CardNumber
    showBrandIcon,
    showContextualElement,
    //
    iOSFocusedField,
    disclaimerMessage,
    //
    onFieldFocusAnalytics,
    onFieldBlurAnalytics
}) => {
    const { i18n } = useCoreContext();

    const cardHolderField = (
        <CardHolderName
            required={holderNameRequired}
            placeholder={placeholders.holderName}
            value={formData.holderName}
            error={!!formErrors.holderName && holderNameRequired}
            isValid={!!formValid.holderName}
            onBlur={handleChangeFor('holderName', 'blur')}
            onInput={handleChangeFor('holderName', 'input')}
            disabled={iOSFocusedField && iOSFocusedField !== 'holderName'}
            onFieldFocusAnalytics={onFieldFocusAnalytics}
            onFieldBlurAnalytics={onFieldBlurAnalytics}
        />
    );

    //  Only if the brands in DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM are present in the binLookup response should we handle dual branding based on EU regulations
    const showDualBrandSelectElements = mustHandleDualBrandingAccordingToEURegulations(
        DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM,
        dualBrandSelectElements,
        'id'
    );

    return (
        <LoadingWrapper status={sfpState.status}>
            {hasHolderName && positionHolderNameOnTop && cardHolderField}

            <CardFields
                showBrandIcon={showBrandIcon}
                showContextualElement={showContextualElement}
                brand={sfpState.brand}
                brandsIcons={brandsIcons}
                brandsConfiguration={brandsConfiguration}
                focusedElement={focusedElement}
                onFocusField={setFocusOn}
                hasCVC={hasCVC}
                cvcPolicy={cvcPolicy}
                expiryDatePolicy={expiryDatePolicy}
                errors={sfpState.errors}
                valid={sfpState.valid}
                dualBrandingElements={dualBrandSelectElements.length > 0 && dualBrandSelectElements}
            />

            {hasHolderName && !positionHolderNameOnTop && cardHolderField}

            {showDualBrandSelectElements && dualBrandSelectElements.length > 0 && dualBrandSelectElements && (
                <Fieldset classNameModifiers={['dual-brand-switcher']} label={i18n.get('creditCard.dualBrand.title')}>
                    <p className={'adyen-checkout-form-instruction'}>{i18n.get('creditCard.dualBrand.description')}</p>
                    <RadioGroupExtended
                        name={'dualBrandSwitcher'}
                        value={selectedBrandValue} // Set which button is in a selected (checked) state
                        items={mapDualBrandButtons(dualBrandSelectElements, brandsConfiguration)}
                        onChange={extensions.handleDualBrandSelection}
                        required={true}
                        showSelectedTick={true}
                    />
                </Fieldset>
            )}

            {showKCP && (
                <KCPAuthentication
                    onFocusField={setFocusOn}
                    focusedElement={focusedElement}
                    encryptedPasswordState={{
                        data: sfpState.encryptedPassword,
                        valid: sfpState.valid ? sfpState.valid.encryptedPassword : false,
                        errors: sfpState.errors ? sfpState.errors.encryptedPassword : false
                    }}
                    value={data.taxNumber}
                    error={!!errors.taxNumber}
                    isValid={!!valid.taxNumber}
                    onBlur={handleChangeFor('taxNumber', 'blur')}
                    onInput={handleChangeFor('taxNumber', 'input')}
                    disabled={iOSFocusedField && iOSFocusedField !== 'kcpTaxNumberOrDOB'}
                    placeholder={placeholders.taxNumber}
                    onFieldFocusAnalytics={onFieldFocusAnalytics}
                    onFieldBlurAnalytics={onFieldBlurAnalytics}
                />
            )}

            {showBrazilianSSN && (
                <div className="adyen-checkout__card__socialSecurityNumber">
                    <SocialSecurityNumberBrazil
                        onBlur={handleChangeFor('socialSecurityNumber', 'blur')}
                        onInput={handleChangeFor('socialSecurityNumber', 'input')}
                        error={errors?.socialSecurityNumber}
                        valid={valid?.socialSecurityNumber}
                        data={socialSecurityNumber}
                        required={true}
                        disabled={iOSFocusedField && iOSFocusedField !== 'socialSecurityNumber'}
                        onFieldFocusAnalytics={onFieldFocusAnalytics}
                        onFieldBlurAnalytics={onFieldBlurAnalytics}
                    />
                </div>
            )}

            {showStoreDetailsCheckbox && <StoreDetails onChange={handleOnStoreDetails} />}

            {hasInstallments && (
                <Installments
                    amount={amount}
                    brand={sfpState.brand}
                    installmentOptions={installmentOptions}
                    onChange={handleInstallments}
                    type={showAmountsInInstallments ? 'amount' : 'months'}
                />
            )}

            {billingAddressRequired && (
                <Address
                    label="billingAddress"
                    data={billingAddress}
                    onChange={handleAddress}
                    allowedCountries={billingAddressAllowedCountries}
                    requiredFields={billingAddressRequiredFields}
                    setComponentRef={setAddressRef}
                    validationRules={billingAddressValidationRules}
                    specifications={partialAddressSchema}
                    iOSFocusedField={iOSFocusedField}
                    onAddressLookup={onAddressLookup}
                    showContextualElement={showContextualElement}
                    onAddressSelected={onAddressSelected}
                    addressSearchDebounceMs={addressSearchDebounceMs}
                    onFieldFocusAnalytics={onFieldFocusAnalytics}
                    onFieldBlurAnalytics={onFieldBlurAnalytics}
                />
            )}

            {disclaimerMessage && (
                <DisclaimerMessage
                    message={disclaimerMessage.message.replace('%{linkText}', `%#${disclaimerMessage.linkText}%#`)}
                    urls={[disclaimerMessage.link]}
                />
            )}
        </LoadingWrapper>
    );
};
