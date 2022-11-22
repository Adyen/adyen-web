import { h, Fragment, FunctionalComponent } from 'preact';
import { useState, useEffect, useRef, useMemo, useCallback } from 'preact/hooks';
import SecuredFieldsProvider from '../../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import { OnChangeEventDetails, SFPState } from '../../../internal/SecuredFields/SFP/types';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import './CardInput.scss';
import { AddressModeOptions, CardInputDataState, CardInputErrorState, CardInputProps, CardInputRef, CardInputValidState } from './types';
import { CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { cardInputFormatters, cardInputValidationRules, getRuleByNameAndMode } from './validate';
import CIExtensions from '../../../internal/SecuredFields/binLookup/extensions';
import useForm from '../../../../utils/useForm';
import { ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import { handlePartialAddressMode, extractPropsForCardFields, extractPropsForSFP, getLayout, sortErrorsForPanel } from './utils';
import { AddressData } from '../../../../types';
import Specifications from '../../../internal/Address/Specifications';
import { StoredCardFieldsWrapper } from './components/StoredCardFieldsWrapper';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';
import styles from './CardInput.module.scss';
import { getAddressHandler, getAutoJumpHandler, getErrorPanelHandler, getFocusHandler } from './handlers';
import { InstallmentsObj } from './components/Installments/Installments';
import { TouchStartEventObj } from './components/types';
import classNames from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';

const CardInput: FunctionalComponent<CardInputProps> = props => {
    const sfp = useRef(null);
    const billingAddressRef = useRef(null);
    const isValidating = useRef(false);
    const { resources } = useCoreContext();

    const cardInputRef = useRef<CardInputRef>({});
    // Just call once
    if (!Object.keys(cardInputRef.current).length) {
        props.setComponentRef(cardInputRef.current);
    }

    const hasPanLengthRef = useRef(0);
    const isAutoJumping = useRef(false);

    const errorFieldId = 'creditCardErrors';

    const { collateErrors, moveFocus, showPanel } = props.SRConfig;

    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    // Store ref to sfp (useful for 'deep' debugging)
    cardInputRef.current.sfp = sfp;

    /**
     * STATE HOOKS
     */
    const [status, setStatus] = useState('ready');

    const [errors, setErrors] = useState<CardInputErrorState>({});
    const [valid, setValid] = useState<CardInputValidState>({
        ...(props.holderNameRequired && { holderName: false })
    });
    const [data, setData] = useState<CardInputDataState>({
        ...(props.hasHolderName && { holderName: props.data.holderName ?? '' })
    });

    // An object containing a collection of all the errors that can be passed to the ErrorPanel to be read by the screenreader
    const [mergedSRErrors, setMergedSRErrors] = useState<ErrorPanelObj>(null);

    const [focusedElement, setFocusedElement] = useState('');
    const [isSfpValid, setIsSfpValid] = useState(false);
    const [expiryDatePolicy, setExpiryDatePolicy] = useState(DATE_POLICY_REQUIRED);
    const [cvcPolicy, setCvcPolicy] = useState(CVC_POLICY_REQUIRED);
    const [issuingCountryCode, setIssuingCountryCode] = useState<string>(null);

    const [dualBrandSelectElements, setDualBrandSelectElements] = useState([]);
    const [selectedBrandValue, setSelectedBrandValue] = useState('');

    const showBillingAddress = props.billingAddressMode !== AddressModeOptions.none && props.billingAddressRequired;

    const partialAddressSchema = handlePartialAddressMode(props.billingAddressMode);

    const [storePaymentMethod, setStorePaymentMethod] = useState(false);
    const [billingAddress, setBillingAddress] = useState<AddressData>(showBillingAddress ? props.data.billingAddress : null);
    const [showSocialSecurityNumber, setShowSocialSecurityNumber] = useState(false);
    const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
    const [installments, setInstallments] = useState<InstallmentsObj>({ value: null });

    // re. Disable arrows for iOS: The name of the element calling for other elements to be disabled
    // - either a securedField type (like 'encryptedCardNumber') when call is coming from SF
    // or else the name of an internal, Adyen-web, element (like 'holderName')
    const [iOSFocusedField, setIOSFocusedField] = useState(null);

    /**
     * LOCAL VARS
     */
    const {
        handleChangeFor,
        triggerValidation,
        data: formData,
        valid: formValid,
        errors: formErrors,
        setSchema,
        setData: setFormData,
        setValid: setFormValid,
        setErrors: setFormErrors
    } = useForm<CardInputDataState>({
        schema: [],
        defaultData: props.data,
        formatters: cardInputFormatters,
        rules: cardInputValidationRules
    });

    const hasInstallments = !!Object.keys(props.installmentOptions).length;
    const showAmountsInInstallments = props.showInstallmentAmounts ?? true;

    const cardCountryCode: string = issuingCountryCode ?? props.countryCode;
    const isKorea = cardCountryCode === 'kr'; // If issuingCountryCode or the merchant defined countryCode is set to 'kr'
    const showKCP = props.configuration.koreanAuthenticationRequired && isKorea;

    const showBrazilianSSN: boolean =
        (showSocialSecurityNumber && props.configuration.socialSecurityNumberMode === 'auto') ||
        props.configuration.socialSecurityNumberMode === 'show';

    /**
     * HANDLERS
     */
    // SecuredField-only handler
    const handleFocus = getFocusHandler(setFocusedElement, props.onFocus, props.onBlur);

    const retrieveLayout = () => {
        return getLayout({
            props,
            showKCP,
            showBrazilianSSN,
            ...(props.billingAddressRequired && {
                countrySpecificSchemas: specifications.getAddressSchemaForCountry(billingAddress?.country),
                billingAddressRequiredFields: props.billingAddressRequiredFields
            })
        });
    };

    /**
     * re. Disabling arrow keys in iOS:
     * Only by disabling all fields in the Card PM except for the active securedField input can we force the iOS soft keyboard arrow keys to disable
     *
     * @param obj - has fieldType prop saying whether this function is being called in response to an securedFields click ('encryptedCardNumber' etc)
     * - in which case we should disable all non-SF fields
     * or,
     * due to an internal action ('webInternalElement') - in which case we can enable all non-SF fields
     */
    const handleTouchstartIOS = useCallback((obj: TouchStartEventObj) => {
        const elementType = obj.fieldType !== 'webInternalElement' ? obj.fieldType : obj.name;
        setIOSFocusedField(elementType);
    }, []);

    // Callback for ErrorPanel
    const handleErrorPanelFocus = getErrorPanelHandler(isValidating, sfp, handleFocus);

    const handleAddress = getAddressHandler(setFormData, setFormValid, setFormErrors);

    const doPanAutoJump = getAutoJumpHandler(isAutoJumping, sfp, retrieveLayout());

    const handleSecuredFieldsChange = (sfState: SFPState, eventDetails?: OnChangeEventDetails): void => {
        // Clear errors so that the screenreader will read them *all* again - without this it only reads the newly added ones
        setMergedSRErrors(null);

        /**
         * Handling auto complete value for holderName (but only if the component is using a holderName field)
         */
        if (sfState.autoCompleteName) {
            if (!props.hasHolderName) return;
            const holderNameValidationFn = getRuleByNameAndMode('holderName', 'blur');
            const acHolderName = holderNameValidationFn(sfState.autoCompleteName) ? sfState.autoCompleteName : null;
            if (acHolderName) {
                setFormData('holderName', acHolderName);
                setFormValid('holderName', true); // only if holderName is valid does this fny get called - so we know it's valid and w/o error
                setFormErrors('holderName', null);
            }
            return;
        }

        /**
         * If PAN has just become valid: decide if we can shift focus to the next field.
         *
         * We can if the config prop, autoFocus, is true AND we have a panLength value from binLookup AND one of the following scenarios is true:
         *  - If encryptedCardNumber was invalid but now is valid
         *      [scenario: shopper has typed in a number and field is now valid]
         *  - If encryptedCardNumber was valid and still is valid and we're handling an onBrand event (triggered by binLookup which has happened after the handleOnFieldValid event)
         *     [scenario: shopper has pasted in a full, valid, number]
         */
        if (
            props.autoFocus &&
            hasPanLengthRef.current > 0 &&
            ((!valid.encryptedCardNumber && sfState.valid?.encryptedCardNumber) ||
                (valid.encryptedCardNumber && sfState.valid.encryptedCardNumber && eventDetails.event === 'handleOnBrand'))
        ) {
            doPanAutoJump();
        }

        /**
         * Process SFP state
         */
        setData({ ...data, ...sfState.data });
        setErrors({ ...errors, ...sfState.errors });
        setValid({ ...valid, ...sfState.valid });

        setIsSfpValid(sfState.isSfpValid);

        // Values relating to /binLookup response
        setCvcPolicy(sfState.cvcPolicy);
        setShowSocialSecurityNumber(sfState.showSocialSecurityNumber);
        setExpiryDatePolicy(sfState.expiryDatePolicy);
    };

    // Farm the handlers for binLookup related functionality out to another 'extensions' file
    const extensions = useMemo(
        () =>
            CIExtensions(
                props,
                { sfp },
                {
                    dualBrandSelectElements,
                    setDualBrandSelectElements,
                    setSelectedBrandValue,
                    issuingCountryCode,
                    setIssuingCountryCode
                },
                hasPanLengthRef
            ),
        [dualBrandSelectElements, issuingCountryCode]
    );

    /**
     * EXPOSE METHODS expected by Card.tsx
     */
    cardInputRef.current.showValidation = () => {
        // Clear errors so that the screenreader will read them *all* again
        setMergedSRErrors(null);

        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName & SSN & KCP (taxNumber) but *not* billingAddress
        triggerValidation(['holderName', 'socialSecurityNumber', 'taxNumber']);

        // Validate Address
        if (billingAddressRef?.current) billingAddressRef.current.showValidation();

        isValidating.current = true;
    };

    cardInputRef.current.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        extensions.processBinLookup(binLookupResponse, isReset);
    };

    cardInputRef.current.setStatus = setStatus;

    /**
     * EFFECT HOOKS
     */
    useEffect(() => {
        // componentDidMount - expose more methods expected by Card.tsx
        cardInputRef.current.setFocusOn = sfp.current.setFocusOn;
        cardInputRef.current.updateStyles = sfp.current.updateStyles;
        cardInputRef.current.handleUnsupportedCard = sfp.current.handleUnsupportedCard;

        // componentWillUnmount
        return () => {
            sfp.current.destroy();
        };
    }, []);

    /**
     * Handle form schema updates
     */
    useEffect(() => {
        const newSchema = [
            ...(props.hasHolderName ? ['holderName'] : []),
            ...(showBrazilianSSN ? ['socialSecurityNumber'] : []),
            ...(showKCP ? ['taxNumber'] : []),
            ...(showBillingAddress ? ['billingAddress'] : [])
        ];
        setSchema(newSchema);
    }, [props.hasHolderName, showBrazilianSSN, showKCP]);

    /**
     * Handle updates from useForm
     */
    useEffect(() => {
        // Clear errors so that the screenreader will read them *all* again
        setMergedSRErrors(null);

        setData({ ...data, holderName: formData.holderName ?? '', taxNumber: formData.taxNumber });

        setSocialSecurityNumber(formData.socialSecurityNumber);

        if (showBillingAddress) setBillingAddress({ ...formData.billingAddress });

        setValid({
            ...valid,
            holderName: props.holderNameRequired ? formValid.holderName : true,
            // Setting value to false if it's falsy keeps in line with existing, expected behaviour
            // - but there is an argument to allow 'undefined' as a value to indicate the non-presence of the field
            socialSecurityNumber: formValid.socialSecurityNumber ? formValid.socialSecurityNumber : false,
            taxNumber: formValid.taxNumber ? formValid.taxNumber : false,
            billingAddress: formValid.billingAddress ? formValid.billingAddress : false
        });

        // Check if billingAddress errors object has any properties that aren't null or undefined
        const addressHasErrors = formErrors.billingAddress
            ? Object.entries(formErrors.billingAddress).reduce((acc, [, error]) => acc || error != null, false)
            : false;

        // Errors
        setErrors({
            ...errors,
            holderName: props.holderNameRequired && !!formErrors.holderName ? formErrors.holderName : null,
            socialSecurityNumber: showBrazilianSSN && !!formErrors.socialSecurityNumber ? formErrors.socialSecurityNumber : null,
            taxNumber: showKCP && !!formErrors.taxNumber ? formErrors.taxNumber : null,
            billingAddress: showBillingAddress && addressHasErrors ? formErrors.billingAddress : null
        });
    }, [formData, formValid, formErrors]);

    /**
     * Main 'componentDidUpdate' handler
     */
    useEffect(() => {
        const holderNameValid: boolean = valid.holderName;

        const sfpValid: boolean = isSfpValid;
        const addressValid: boolean = showBillingAddress ? valid.billingAddress : true;

        const koreanAuthentication: boolean = showKCP ? !!valid.taxNumber && !!valid.encryptedPassword : true;

        const socialSecurityNumberValid: boolean = showBrazilianSSN ? !!valid.socialSecurityNumber : true;

        const isValid: boolean = sfpValid && holderNameValid && addressValid && koreanAuthentication && socialSecurityNumberValid;

        const sfStateErrorsObj = sfp.current.mapErrorsToValidationRuleResult();
        const mergedErrors = { ...errors, ...sfStateErrorsObj }; // maps sfErrors AND solves race condition problems for sfp from showValidation

        // Extract and then flatten billingAddress errors into a new object with *all* the field errors at top level
        const { billingAddress: extractedAddressErrors, ...errorsWithoutAddress } = mergedErrors;
        const errorsForPanel = { ...errorsWithoutAddress, ...extractedAddressErrors };

        const sortedMergedErrors = sortErrorsForPanel({
            errors: errorsForPanel,
            layout: retrieveLayout(),
            i18n: props.i18n,
            countrySpecificLabels: specifications.getAddressLabelsForCountry(billingAddress?.country)
        });
        setMergedSRErrors(sortedMergedErrors);

        props.onChange({
            data,
            valid,
            errors: mergedErrors,
            isValid,
            billingAddress,
            selectedBrandValue,
            storePaymentMethod,
            socialSecurityNumber,
            installments
        });
    }, [data, valid, errors, selectedBrandValue, storePaymentMethod, installments]);

    /**
     * RENDER
     */
    const FieldToRender = props.storedPaymentMethodId ? StoredCardFieldsWrapper : CardFieldsWrapper;

    return (
        <Fragment>
            <SecuredFieldsProvider
                ref={sfp}
                {...extractPropsForSFP(props)}
                styles={{ ...defaultStyles, ...props.styles }}
                koreanAuthenticationRequired={props.configuration.koreanAuthenticationRequired}
                hasKoreanFields={!!(props.configuration.koreanAuthenticationRequired && props.countryCode === 'kr')}
                onChange={handleSecuredFieldsChange}
                onBrand={props.onBrand}
                onFocus={handleFocus}
                type={props.brand}
                isCollatingErrors={collateErrors}
                onTouchstartIOS={handleTouchstartIOS}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div
                        ref={setRootNode}
                        className={classNames({
                            'adyen-checkout__card-input': true,
                            [styles['card-input__wrapper']]: true,
                            [`adyen-checkout__card-input--${props.fundingSource ?? 'credit'}`]: true,
                            'adyen-checkout__card-input--loading': status === 'loading'
                        })}
                        role={collateErrors && 'form'}
                        aria-describedby={collateErrors ? errorFieldId : null}
                    >
                        <FieldToRender
                            // Extract exact props that we need to pass down
                            {...extractPropsForCardFields(props)}
                            // Pass on vars created in CardInput:
                            // Base (shared w. StoredCard)
                            data={data}
                            valid={valid}
                            errors={errors}
                            handleChangeFor={handleChangeFor}
                            focusedElement={focusedElement}
                            setFocusOn={setFocusOn}
                            sfpState={sfpState}
                            collateErrors={collateErrors}
                            errorFieldId={errorFieldId}
                            cvcPolicy={cvcPolicy}
                            hasInstallments={hasInstallments}
                            showAmountsInInstallments={showAmountsInInstallments}
                            handleInstallments={setInstallments}
                            // For Card
                            brandsIcons={props.brandsIcons}
                            mergedSRErrors={mergedSRErrors}
                            moveFocus={moveFocus}
                            showPanel={showPanel}
                            handleErrorPanelFocus={handleErrorPanelFocus}
                            formData={formData}
                            formErrors={formErrors}
                            formValid={formValid}
                            expiryDatePolicy={expiryDatePolicy}
                            dualBrandSelectElements={dualBrandSelectElements}
                            extensions={extensions}
                            selectedBrandValue={selectedBrandValue}
                            // For KCP
                            showKCP={showKCP}
                            // For SSN
                            showBrazilianSSN={showBrazilianSSN}
                            socialSecurityNumber={socialSecurityNumber}
                            // For Store details
                            handleOnStoreDetails={setStorePaymentMethod}
                            // For Address
                            billingAddress={billingAddress}
                            handleAddress={handleAddress}
                            billingAddressRef={billingAddressRef}
                            partialAddressSchema={partialAddressSchema}
                            //
                            iOSFocusedField={iOSFocusedField}
                        />
                    </div>
                )}
            />
            {props.showPayButton &&
                props.payButton({
                    status,
                    variant: props.isPayButtonPrimaryVariant ? 'primary' : 'secondary',
                    icon: resources.getImage({ imageFolder: 'components/' })('lock')
                })}
        </Fragment>
    );
};

CardInput.defaultProps = defaultProps;

export default CardInput;
