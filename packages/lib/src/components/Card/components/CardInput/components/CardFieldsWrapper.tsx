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
    enableStoreDetails,
    hasCVC,
    hasHolderName,
    holderNameRequired,
    installmentOptions,
    placeholders,
    positionHolderNameOnTop,
    // For CardFields > CardNumber
    showBrandIcon,
    showBrandsUnderCardNumber,
    //
    iOSFocusedField,
    disclaimerMessage,
    //
    onFieldFocusAnalytics,
    onFieldBlurAnalytics
}) => {
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

    return (
        <LoadingWrapper status={sfpState.status}>
            {hasHolderName && positionHolderNameOnTop && cardHolderField}

            <CardFields
                showBrandIcon={showBrandIcon}
                showBrandsUnderCardNumber={showBrandsUnderCardNumber}
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
                dualBrandingChangeHandler={extensions.handleDualBrandSelection}
                dualBrandingSelected={selectedBrandValue}
            />

            {hasHolderName && !positionHolderNameOnTop && cardHolderField}

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

            {enableStoreDetails && <StoreDetails onChange={handleOnStoreDetails} />}

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
                    onAddressSelected={onAddressSelected}
                    addressSearchDebounceMs={addressSearchDebounceMs}
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
