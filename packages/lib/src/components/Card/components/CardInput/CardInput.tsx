import { h, Fragment, FunctionalComponent } from 'preact';
import { useState, useEffect, useRef, useMemo, useCallback } from 'preact/hooks';
import SecuredFieldsProvider from '../../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import { OnChangeEventDetails, SFPState } from '../../../internal/SecuredFields/SFP/types';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import './CardInput.scss';
import { AddressModeOptions, CardInputDataState, CardInputErrorState, CardInputProps, CardInputRef, CardInputValidState } from './types';
import { CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED, ENCRYPTED_CARD_NUMBER } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { cardInputFormatters, cardInputValidationRules, getRuleByNameAndMode } from './validate';
import CIExtensions from '../../../internal/SecuredFields/binLookup/extensions';
import useForm from '../../../../utils/useForm';
import { SetSRMessagesReturnObject, SortedErrorObject } from '../../../../core/Errors/types';
import { handlePartialAddressMode, extractPropsForCardFields, extractPropsForSFP, getLayout, lookupBlurBasedErrors, mapFieldKey } from './utils';
import { usePrevious } from '../../../../utils/hookUtils';
import { AddressData } from '../../../../types';
import Specifications from '../../../internal/Address/Specifications';
import { StoredCardFieldsWrapper } from './components/StoredCardFieldsWrapper';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';
import styles from './CardInput.module.scss';
import { getAddressHandler, getAutoJumpHandler, getFocusHandler, setFocusOnFirstField } from './handlers';
import { InstallmentsObj } from './components/Installments/Installments';
import { TouchStartEventObj } from './components/types';
import classNames from 'classnames';
import { getPartialAddressValidationRules } from '../../../internal/Address/validate';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../../core/Errors/constants';
import useSRPanelContext from '../../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../../core/Errors/SRPanelProvider';
import useImage from '../../../../core/Context/useImage';
import { getArrayDifferences } from '../../../../utils/arrayUtils';
import FormInstruction from '../../../internal/FormInstruction';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import { FieldErrorAnalyticsObject } from '../../../../core/Analytics/types';

const CardInput: FunctionalComponent<CardInputProps> = props => {
    const sfp = useRef(null);
    const isValidating = useRef(false);
    const getImage = useImage();

    /** SR stuff */
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    // Generate a setSRMessages function - implemented as a partial, since the initial set of arguments don't change.
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({
        fieldTypeMappingFn: mapFieldKey
    });
    /** end SR stuff */

    const billingAddressRef = useRef(null);
    const setAddressRef = ref => {
        billingAddressRef.current = ref;
    };

    const cardInputRef = useRef<CardInputRef>({});
    // Just call once to create the object by which we expose the members expected by the parent Card comp
    if (!Object.keys(cardInputRef.current).length) {
        props.setComponentRef(cardInputRef.current);
    }

    const hasPanLengthRef = useRef(0);
    const isAutoJumping = useRef(false);

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

    const [sortedErrorList, setSortedErrorList] = useState<SortedErrorObject[]>(null);

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

    const hasInstallments = !!Object.keys(props.installmentOptions).length && props.fundingSource !== 'debit';
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
    // Handlers for focus & blur on all fields. Can be renamed to onFieldFocus once the onFocusField is renamed in Field.tsx
    const onFieldFocusAnalytics = (who: string, e: Event | CbObjOnFocus) => {
        props.onFocus({ fieldType: who, event: e });
    };
    const onFieldBlurAnalytics = (who: string, e: Event | CbObjOnFocus) => {
        props.onBlur({ fieldType: who, event: e });
    };

    // Make SecuredFields aware of the focus & blur handlers
    const handleFocus = getFocusHandler(setFocusedElement, onFieldFocusAnalytics, onFieldBlurAnalytics);

    const retrieveLayout = (): string[] => {
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
     * NOTE: only called if ua.__IS_IOS = true && this.config.disableIOSArrowKeys = true (as referenced in CSF)
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

    const handleAddress = getAddressHandler(setFormData, setFormValid, setFormErrors);

    const doPanAutoJump = getAutoJumpHandler(isAutoJumping, sfp, retrieveLayout());

    const handleSecuredFieldsChange = (sfState: SFPState, eventDetails?: OnChangeEventDetails): void => {
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
         * Decide if we can shift focus to the expiryDate field.
         *
         * We can if... the config prop, autoFocus, is true AND we have a panLength value from binLookup
         * AND we are responding to a handleOnFieldValid message about the PAN that says it is valid
         */
        if (
            props.autoFocus &&
            hasPanLengthRef.current > 0 &&
            eventDetails?.event === 'handleOnFieldValid' &&
            eventDetails?.fieldType === ENCRYPTED_CARD_NUMBER &&
            sfState.valid.encryptedCardNumber
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
        // set flag
        isValidating.current = true;

        /**
         * Clear errors prior to validating so that the screenreader will read them *all* again, and in the right order
         * - only using aria-atomic on the error panel will read them in the wrong order
         */
        clearSRPanel?.(); // TODO - recheck if this is still true

        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName & SSN & KCP (taxNumber) but *not* billingAddress
        triggerValidation(['holderName', 'socialSecurityNumber', 'taxNumber']);

        // Validate Address
        if (billingAddressRef?.current) billingAddressRef.current.showValidation();
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

        // Pass dynamic props (errors, layout etc) to SRPanel via partial
        const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({
            errors: errorsForPanel,
            isValidating: isValidating.current,
            layout: retrieveLayout(),
            // If we don't have country specific address labels, we might have a label related to a partialAddressSchema (i.e. zipCode)
            countrySpecificLabels: specifications.getAddressLabelsForCountry(billingAddress?.country) ?? partialAddressSchema?.default?.labels
        });

        /**
         * Need extra actions after setting SRPanel messages in order to focus field (if required) and because we have some errors that are fired onBlur
         */
        const currentErrorsSortedByLayout = srPanelResp?.currentErrorsSortedByLayout;

        // Store the array of sorted error objects separately so that we can use it to make comparisons between the old and new arrays
        setSortedErrorList(currentErrorsSortedByLayout);

        switch (srPanelResp?.action) {
            // A call to focus the first field in error will always follow the call to validate the whole form
            case ERROR_ACTION_FOCUS_FIELD:
                if (shouldMoveFocusSR) setFocusOnFirstField(isValidating.current, sfp, srPanelResp?.fieldToFocus);
                // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
                setTimeout(() => {
                    isValidating.current = false;
                }, 300);
                break;
            /** On blur scenario: not validating, i.e. trying to submit form, but there might be an error, either to set or to clear */
            case ERROR_ACTION_BLUR_SCENARIO: {
                const difference = getArrayDifferences<SortedErrorObject, string>(currentErrorsSortedByLayout, previousSortedErrors, 'field');

                const latestErrorMsg = difference?.[0];

                if (latestErrorMsg) {
                    // Use the error code to look up whether error is actually a blur based one (most are but some SF ones aren't)
                    const isBlurBasedError = lookupBlurBasedErrors(latestErrorMsg.errorCode);

                    /**
                     *  ONLY ADD BLUR BASED ERRORS TO THE ERROR PANEL - doing this step prevents the non-blur based errors from being read out twice
                     *  (once from the aria-live, error panel & once from the aria-describedby element)
                     */
                    const latestSRError = isBlurBasedError ? latestErrorMsg.errorMessage : null;
                    // console.log('### CardInput2::componentDidUpdate:: #2 (not validating) single error:: latestSRError', latestSRError);
                    setSRMessagesFromStrings(latestSRError);
                } else {
                    // called when previousSortedErrors.length >= currentErrorsSortedByLayout.length
                    // console.log('### CardInput2::componentDidUpdate:: #3(not validating) clearing errors:: NO latestErrorMsg');
                    clearSRPanel();
                }
                break;
            }
            default:
                break;
        }

        // Analytics
        if (currentErrorsSortedByLayout) {
            const newErrors = getArrayDifferences<SortedErrorObject, string>(currentErrorsSortedByLayout, previousSortedErrors, 'field');
            newErrors?.forEach(errorItem => {
                const aObj: FieldErrorAnalyticsObject = {
                    fieldType: errorItem.field,
                    errorCode: errorItem.errorCode
                };

                props.onErrorAnalytics(aObj);
            });
        }

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
                disableIOSArrowKeys={props.disableIOSArrowKeys ? handleTouchstartIOS : null}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div
                        ref={setRootNode}
                        className={classNames({
                            'adyen-checkout__card-input': true,
                            [styles['card-input__wrapper']]: true,
                            [`adyen-checkout__card-input--${props.fundingSource ?? 'credit'}`]: true,
                            'adyen-checkout__card-input--loading': status === 'loading'
                        })}
                        role={'form'}
                    >
                        {props.showFormInstruction && <FormInstruction />}
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
                            cvcPolicy={cvcPolicy}
                            hasInstallments={hasInstallments}
                            showAmountsInInstallments={showAmountsInInstallments}
                            handleInstallments={setInstallments}
                            // For Card
                            brandsIcons={props.brandsIcons}
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
                            setAddressRef={setAddressRef}
                            billingAddress={billingAddress}
                            billingAddressValidationRules={partialAddressSchema && getPartialAddressValidationRules(partialAddressCountry.current)}
                            partialAddressSchema={partialAddressSchema}
                            handleAddress={handleAddress}
                            onAddressLookup={props.onAddressLookup}
                            onAddressSelected={props.onAddressSelected}
                            addressSearchDebounceMs={props.addressSearchDebounceMs}
                            //
                            iOSFocusedField={iOSFocusedField}
                            //
                            onFieldFocusAnalytics={onFieldFocusAnalytics}
                            onFieldBlurAnalytics={onFieldBlurAnalytics}
                        />
                    </div>
                )}
            />
            {props.showPayButton &&
                props.payButton({
                    status,
                    variant: props.isPayButtonPrimaryVariant ? 'primary' : 'secondary',
                    icon: getImage({ imageFolder: 'components/' })('lock')
                })}
        </Fragment>
    );
};

CardInput.defaultProps = defaultProps;

export default CardInput;
