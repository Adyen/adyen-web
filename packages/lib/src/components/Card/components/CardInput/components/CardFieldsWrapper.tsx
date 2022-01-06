import { h } from 'preact';
import styles from '../CardInput.module.scss';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import { ErrorPanel } from '../../../../../core/Errors/ErrorPanel';
import CardFields from './CardFields';
import KCPAuthentication from './KCPAuthentication';
import SocialSecurityNumberBrazil from '../../../../internal/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
import StoreDetails from '../../../../internal/StoreDetails';
import Address from '../../../../internal/Address';

export const CardFieldsWrapper = ({
    // base
    data,
    valid,
    errors,
    handleChangeFor,
    i18n,
    setRootNode,
    sfpState,
    setFocusOn,
    collateErrors,
    errorFieldId,
    cvcPolicy,
    focusedElement,
    hasInstallments,
    getInstallmentsComp,
    // Card
    mergedSRErrors,
    moveFocus,
    showPanel,
    handleErrorPanelFocus,
    cardHolderField,
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
    billingAddressRef,
    // props
    ...props
}) => {
    console.log('### CardFieldsWrapper::CardFieldsWrapper:: props', props);
    return (
        <div
            ref={setRootNode}
            className={`adyen-checkout__card-input ${styles['card-input__wrapper']} adyen-checkout__card-input--${props.fundingSource ?? 'credit'}`}
            role={collateErrors && 'form'}
            aria-describedby={collateErrors ? errorFieldId : null}
        >
            <LoadingWrapper status={sfpState.status}>
                {collateErrors && (
                    <ErrorPanel
                        id={errorFieldId}
                        heading={i18n.get('errorPanel.title')}
                        errors={mergedSRErrors}
                        callbackFn={moveFocus ? handleErrorPanelFocus : null}
                        showPanel={showPanel}
                    />
                )}

                {props.hasHolderName && props.positionHolderNameOnTop && cardHolderField}

                <CardFields
                    {...props}
                    brand={sfpState.brand}
                    brandsConfiguration={props.brandsConfiguration}
                    focusedElement={focusedElement}
                    onFocusField={setFocusOn}
                    hasCVC={props.hasCVC}
                    cvcPolicy={cvcPolicy}
                    expiryDatePolicy={expiryDatePolicy}
                    errors={sfpState.errors}
                    valid={sfpState.valid}
                    dualBrandingElements={dualBrandSelectElements.length > 0 && dualBrandSelectElements}
                    dualBrandingChangeHandler={extensions.handleDualBrandSelection}
                    dualBrandingSelected={selectedBrandValue}
                />

                {props.hasHolderName && !props.positionHolderNameOnTop && cardHolderField}

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
                        onChange={handleChangeFor('taxNumber', 'blur')}
                        onInput={handleChangeFor('taxNumber', 'input')}
                    />
                )}

                {showBrazilianSSN && (
                    <div className="adyen-checkout__card__socialSecurityNumber">
                        <SocialSecurityNumberBrazil
                            onChange={handleChangeFor('socialSecurityNumber', 'blur')}
                            onInput={handleChangeFor('socialSecurityNumber', 'input')}
                            error={errors?.socialSecurityNumber}
                            valid={valid?.socialSecurityNumber}
                            data={socialSecurityNumber}
                            required={true}
                        />
                    </div>
                )}

                {props.enableStoreDetails && <StoreDetails onChange={handleOnStoreDetails} />}

                {hasInstallments && getInstallmentsComp(sfpState.brand)}

                {props.billingAddressRequired && (
                    <Address
                        label="billingAddress"
                        data={billingAddress}
                        onChange={handleAddress}
                        allowedCountries={props.billingAddressAllowedCountries}
                        requiredFields={props.billingAddressRequiredFields}
                        ref={billingAddressRef}
                    />
                )}
            </LoadingWrapper>
        </div>
    );
};
