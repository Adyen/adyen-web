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
import {
    handlePartialAddressMode,
    extractPropsForCardFields,
    extractPropsForSFP,
    getLayout,
    sortErrorsForPanel,
    usePrevious,
    lookupBlurBasedErrors
} from './utils';
import { AddressData } from '../../../../types';
import Specifications from '../../../internal/Address/Specifications';
import { StoredCardFieldsWrapper } from './components/StoredCardFieldsWrapper';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';
import getImage from '../../../../utils/get-image';
import styles from './CardInput.module.scss';
import { getAddressHandler, getAutoJumpHandler, getErrorPanelHandler, getFocusHandler } from './handlers';
import { InstallmentsObj } from './components/Installments/Installments';
import { TouchStartEventObj } from './components/types';
import classNames from 'classnames';
import { getPartialAddressValidationRules } from '../../../internal/Address/validate';

const CardInput: FunctionalComponent<CardInputProps> = props => {
    const sfp = useRef(null);
    const billingAddressRef = useRef(null);
    const isValidating = useRef(false);

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

    // const [sortedErrorList, setSortedErrorList] = useState<string[]>(null);
    const [sortedErrorList, setSortedErrorList] = useState<ErrorPanelObj>(null);

    const [focusedElement, setFocusedElement] = useState('');
    const [isSfpValid, setIsSfpValid] = useState(false);
    const [expiryDatePolicy, setExpiryDatePolicy] = useState(DATE_POLICY_REQUIRED);
    const [cvcPolicy, setCvcPolicy] = useState(CVC_POLICY_REQUIRED);
    const [issuingCountryCode, setIssuingCountryCode] = useState<string>(null);

    const [dualBrandSelectElements, setDualBrandSelectElements] = useState([]);
    const [selectedBrandValue, setSelectedBrandValue] = useState('');

    const showBillingAddress = props.billingAddressMode !== AddressModeOptions.none && props.billingAddressRequired;

    const partialAddressSchema = handlePartialAddressMode(props.billingAddressMode);
    // Keeps the value of the country set initially by the merchant, before the Address Component mutates it
    const partialAddressCountry = useRef<string>(partialAddressSchema && props.data?.billingAddress?.country);

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
     * NOTE: only called if ua.__IS_IOS = true (as referenced in CSF)
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

    useEffect(() => {
        console.log('### CardInput:::: IS VALIDATING', isValidating.current);
        // sfp.current.setIsValidating(isValidating.current);
    }, [isValidating.current]);

    const handleAddress = getAddressHandler(setFormData, setFormValid, setFormErrors);

    const doPanAutoJump = getAutoJumpHandler(isAutoJumping, sfp, retrieveLayout());

    const handleSecuredFieldsChange = (sfState: SFPState, eventDetails?: OnChangeEventDetails): void => {
        // Clear errors so that the screenreader will read them *all* again - without this it only reads the newly added ones
        // setMergedSRErrors(null);

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
                { dualBrandSelectElements, setDualBrandSelectElements, setSelectedBrandValue, issuingCountryCode, setIssuingCountryCode },
                hasPanLengthRef
            ),
        [dualBrandSelectElements, issuingCountryCode]
    );

    /**
     * EXPOSE METHODS expected by Card.tsx
     */
    cardInputRef.current.showValidation = () => {
        // set flag
        isValidating.current = true;

        /**
         * Clear errors so that the screenreader will read them *all* again
         * (and in the right order - only using aria-atomic on the error panel will read them in the wrong order)
         */
        setMergedSRErrors(null);

        // setTimeout(() => {
        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName & SSN & KCP (taxNumber) but *not* billingAddress
        triggerValidation(['holderName', 'socialSecurityNumber', 'taxNumber']);

        // Validate Address
        if (billingAddressRef?.current) billingAddressRef.current.showValidation();

        // isValidating.current = true;
        // }, 500);
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
        // setMergedSRErrors(null);

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

    // Get the previous value
    const previousSortedErrors = usePrevious(sortedErrorList);
    // const prevErrors = usePrevious(mergedSRErrors);

    /**
     * Main 'componentDidUpdate' handler
     */
    useEffect(() => {
        console.log('### CardInput::componentDidUpdate:: ');
        const holderNameValid: boolean = valid.holderName;

        const sfpValid: boolean = isSfpValid;
        const addressValid: boolean = showBillingAddress ? valid.billingAddress : true;

        const koreanAuthentication: boolean = showKCP ? !!valid.taxNumber && !!valid.encryptedPassword : true;

        const socialSecurityNumberValid: boolean = showBrazilianSSN ? !!valid.socialSecurityNumber : true;

        const isValid: boolean = sfpValid && holderNameValid && addressValid && koreanAuthentication && socialSecurityNumberValid;

        const sfStateErrorsObj = sfp.current.mapErrorsToValidationRuleResult();
        const mergedErrors = { ...errors, ...sfStateErrorsObj }; // maps sfErrors AND solves race condition problems for sfp from showValidation

        // console.log('### CardInput::componentDidUpdate:: mergedErrors', mergedErrors);

        // Extract and then flatten billingAddress errors into a new object with *all* the field errors at top level
        const { billingAddress: extractedAddressErrors, ...errorsWithoutAddress } = mergedErrors;
        const errorsForPanel = { ...errorsWithoutAddress, ...extractedAddressErrors };

        // Sort active errors based on layout
        const sortedMergedErrors = sortErrorsForPanel({
            errors: errorsForPanel,
            layout: retrieveLayout(),
            i18n: props.i18n,
            countrySpecificLabels: specifications.getAddressLabelsForCountry(billingAddress?.country)
        });

        console.log('### CardInput::componentDidUpdate:: errorsForPanel', errorsForPanel);
        console.log('### CardInput::componentDidUpdate:: sortedMergedErrors?.errorMessages', sortedMergedErrors?.errorMessages);

        // Store the list of errorMessages separately so that we can use it to make comparisons between the old and new arrays
        // setSortedErrorList(sortedMergedErrors?.errorMessages);
        setSortedErrorList(sortedMergedErrors);

        console.log('### CardInput::componentDidUpdate:: isValidating', isValidating.current);
        console.log('### CardInput::componentDidUpdate:: previousSortedErrors', previousSortedErrors);
        // console.log('### CardInput::componentDidUpdate:: sortedMergedErrors', sortedMergedErrors);

        if (sortedMergedErrors) {
            /** If validating i.e. "on submit" type event (pay button pressed) - then display all errors in the error panel */

            // SIMPLER - WHEN WE JUST NEED THE ERROR MSG STRINGS
            // if (isValidating.current) {
            //     setMergedSRErrors(sortedMergedErrors);
            // } else {
            //     /** Else we are in an onBlur scenario - so find the latest error message */
            //     let difference;
            //     const currentSortedErrors = sortedMergedErrors.errorMessages;
            //
            //     // Nothing to compare, so take the new item
            //     if (currentSortedErrors.length === 1 && !prevSortedErrors) {
            //         difference = currentSortedErrors;
            //     }
            //
            //     // Find the difference: what's in the new array that wasn't in the old array?
            //     if (currentSortedErrors.length > prevSortedErrors?.length) {
            //         const arr1 = prevSortedErrors;
            //         const arr2 = currentSortedErrors;
            //         difference = arr2.filter(x => !arr1.includes(x));
            //     }
            //
            //     // Create an item for the error panel
            //     const latestItem = difference?.[0];
            //     console.log('### CardInput::componentDidUpdate:: latest item=', latestItem);
            //     const latestErrorItem = { errorMessages: [latestItem], fieldList: null };
            //     setMergedSRErrors(latestErrorItem);
            // }

            // MORE COMPLEX IF WE ALSO NEED THE FIELDS IN ERROR IN ORDER TO EXTRACT THE ORIGINAL ERROR CODE AND USE THIS TO LOOK UP WHETHER THE ERROR IS BLUR BASED OR NOT
            if (isValidating.current) {
                setMergedSRErrors(sortedMergedErrors);
            } else {
                /** Else we are in an onBlur scenario - so find the latest error message */
                let difference;
                const currentSortedErrors = sortedMergedErrors.fieldList;
                const prevSortedErrors = previousSortedErrors?.fieldList;

                // Nothing to compare, so take the new item
                if (currentSortedErrors.length === 1 && !prevSortedErrors) {
                    difference = currentSortedErrors;
                }

                // Find the difference: what's in the new array that wasn't in the old array?
                if (currentSortedErrors.length > prevSortedErrors?.length) {
                    const arr1 = prevSortedErrors;
                    const arr2 = currentSortedErrors;
                    difference = arr2.filter(x => !arr1.includes(x));
                }

                // Create an item for the error panel
                const latestItem = difference?.[0];
                console.log('### CardInput::componentDidUpdate:: latest item=', latestItem);

                if (latestItem) {
                    const index = sortedMergedErrors?.fieldList.findIndex(item => item === latestItem);
                    const latestErrorItem = { errorMessages: [sortedMergedErrors?.errorMessages[index]], fieldList: null }; //[latestItem] };
                    console.log('### CardInput::componentDidUpdate:: original error= ', errorsForPanel[latestItem]);

                    // Lookup whether error is actually a blur base one - most are but some of the SF ones aren't
                    const errorCode = errorsForPanel[latestItem].error || errorsForPanel[latestItem].errorMessage;
                    const isBlurBasedError = lookupBlurBasedErrors(errorCode);

                    console.log('### CardInput::componentDidUpdate:: isBlurBasedError', isBlurBasedError);

                    // Add blur based errors to the error panel - doing this step prevents the non-blur based errors from being read out twice
                    // (once from the aria-live, error panel & once from the aria-describedby element)
                    const latestSRError = isBlurBasedError ? latestErrorItem : null;
                    console.log('### CardInput::componentDidUpdate:: latestSRError', latestSRError);
                    setMergedSRErrors(latestSRError);
                } else {
                    console.log('### CardInput::componentDidUpdate:: NO latestErrorItem');
                    setMergedSRErrors(null);
                }
            }
        }

        // If validating i.e. "on submit" type event (pay button pressed) - then display all errors in the error panel
        // if (isValidating.current) {
        //     setMergedSRErrors(sortedMergedErrors);
        // } else {
        //     // Else we are in an onBlur scenario
        //     let difference;
        //     if (sortedMergedErrors?.fieldList?.length === 1) {
        //         difference = sortedMergedErrors.fieldList;
        //     }
        //
        //     if (sortedMergedErrors?.fieldList?.length > prevErrors?.fieldList?.length) {
        //         const arr1 = prevErrors?.fieldList;
        //         const arr2 = sortedMergedErrors?.fieldList;
        //
        //         difference = arr2.filter(x => !arr1.includes(x));
        //
        //         // let difference = arr1?.filter(x => !arr2?.includes(x)).concat(arr2?.filter(x => !arr1?.includes(x)));
        //     }
        //     console.log('### CardInput::componentDidUpdate:: latest item=', difference?.[0]);
        //
        //     // const latestItem = difference?.[0];
        //     // const index = sortedMergedErrors?.fieldList.findIndex(latestItem);
        //     // const latestErrorItem = { errorMessages: [sortedMergedErrors?.errorMessages[index]], fieldList: [latestItem] };
        // }

        // setMergedSRErrors(sortedMergedErrors);

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
                // isCollatingErrors={collateErrors}
                isCollatingErrors={isValidating.current}
                {...(props.disableIOSArrowKeys && { onTouchstartIOS: handleTouchstartIOS })}
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
                        // aria-describedby={collateErrors ? errorFieldId : null}
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
                            // moveFocus={moveFocus}
                            moveFocus={true}
                            showPanel={true}
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
                            billingAddressRef={billingAddressRef}
                            billingAddress={billingAddress}
                            billingAddressValidationRules={partialAddressSchema && getPartialAddressValidationRules(partialAddressCountry.current)}
                            partialAddressSchema={partialAddressSchema}
                            handleAddress={handleAddress}
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
                    icon: getImage({ loadingContext: props.loadingContext, imageFolder: 'components/' })('lock')
                })}
        </Fragment>
    );
};

CardInput.defaultProps = defaultProps;

export default CardInput;
