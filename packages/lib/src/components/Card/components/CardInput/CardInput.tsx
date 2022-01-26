import { h, Fragment, FunctionalComponent } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import SecuredFieldsProvider, { SFPState } from '../../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import './CardInput.scss';
import { CardInputProps, CardInputValidState, CardInputErrorState, CardInputDataState, CardInputRef } from './types';
import { CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { cardInputFormatters, cardInputValidationRules, getRuleByNameAndMode } from './validate';
import CIExtensions from '../../../internal/SecuredFields/binLookup/extensions';
import useForm from '../../../../utils/useForm';
import { ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import { extractCardInputProps, getLayout, sortErrorsForPanel } from './utils';
import { AddressData } from '../../../../types';
import Specifications from '../../../internal/Address/Specifications';
import { ValidationRuleResult } from '../../../../utils/Validator/Validator';
import { StoredCardFieldsWrapper } from './components/StoredCardFieldsWrapper';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';
import getImage from '../../../../utils/get-image';
import styles from './CardInput.module.scss';
import { getErrorPanelHandler, getAddressHandler, getFocusHandler } from './handlers';
import { InstallmentsObj } from './components/Installments/Installments';

const CardInput: FunctionalComponent<CardInputProps> = props => {
    const sfp = useRef(null);
    const billingAddressRef = useRef(null);
    const isValidating = useRef(false);

    const cardInputRef = useRef<CardInputRef>({});
    // Just call once
    if (!Object.keys(cardInputRef.current).length) {
        props.setComponentRef(cardInputRef.current);
    }

    const errorFieldId = 'creditCardErrors';

    const { collateErrors, moveFocus, showPanel } = props.SRConfig;

    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    // Creates access to sfp so we can call functionality on it (like handleOnAutoComplete) directly from the console. Used for testing.
    if (process.env.NODE_ENV === 'development') cardInputRef.current.sfp = sfp;

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

    const [storePaymentMethod, setStorePaymentMethod] = useState(false);
    const [billingAddress, setBillingAddress] = useState<AddressData>(props.billingAddressRequired ? props.data.billingAddress : null);
    const [showSocialSecurityNumber, setShowSocialSecurityNumber] = useState(false);
    const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
    const [installments, setInstallments] = useState<InstallmentsObj>({ value: null });

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

    // Callback for ErrorPanel
    const handleErrorPanelFocus = getErrorPanelHandler(isValidating, sfp, handleFocus);

    const handleAddress = getAddressHandler(setFormData, setFormValid, setFormErrors);

    const handleSecuredFieldsChange = (sfState: SFPState): void => {
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
                { dualBrandSelectElements, setDualBrandSelectElements, setSelectedBrandValue, issuingCountryCode, setIssuingCountryCode }
            ),
        [dualBrandSelectElements, issuingCountryCode]
    );

    /**
     * EXPECTED METHODS ON CARD.THIS
     */
    cardInputRef.current.showValidation = () => {
        // Clear errors so that the screenreader will read them *all* again
        setMergedSRErrors(null);

        // Validate SecuredFields
        sfp.current.showValidation();

        // Validates holderName & SSN & KCP (taxNumber)
        triggerValidation();

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
        // componentDidMount
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
            ...(props.billingAddressRequired ? ['billingAddress'] : [])
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

        if (props.billingAddressRequired) setBillingAddress({ ...formData.billingAddress });

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
        // NOTE: when showValidation is called on the Address component it calls back twice - once, incorrectly, with formErrors.billingAddress as an instance of ValidationRuleResult
        // and second time round, correctly  with formErrors.billingAddress as an object containing ValidationRuleResults mapped to address keys (street, city etc)
        // - so we need to ignore the first callback TODO - investigate why this happens
        const addressHasErrors =
            formErrors.billingAddress && !(formErrors.billingAddress instanceof ValidationRuleResult)
                ? Object.entries(formErrors.billingAddress).reduce((acc, [, error]) => acc || error != null, false)
                : false;

        // Errors
        setErrors({
            ...errors,
            holderName: props.holderNameRequired && !!formErrors.holderName ? formErrors.holderName : null,
            socialSecurityNumber: showBrazilianSSN && !!formErrors.socialSecurityNumber ? formErrors.socialSecurityNumber : null,
            taxNumber: showKCP && !!formErrors.taxNumber ? formErrors.taxNumber : null,
            billingAddress: props.billingAddressRequired && addressHasErrors ? formErrors.billingAddress : null
        });
    }, [formData, formValid, formErrors]);

    /**
     * Main 'componentDidUpdate' handler
     */
    useEffect(() => {
        const holderNameValid: boolean = valid.holderName;

        const sfpValid: boolean = isSfpValid;
        const addressValid: boolean = props.billingAddressRequired ? valid.billingAddress : true;

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
            layout: getLayout({
                props,
                showKCP,
                showBrazilianSSN,
                countrySpecificSchemas: props.billingAddressRequired ? specifications.getAddressSchemaForCountry(billingAddress?.country) : null
            }),
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
                {...props}
                styles={{ ...defaultStyles, ...props.styles }}
                koreanAuthenticationRequired={props.configuration.koreanAuthenticationRequired}
                hasKoreanFields={!!(props.configuration.koreanAuthenticationRequired && props.countryCode === 'kr')}
                onChange={handleSecuredFieldsChange}
                onBrand={props.onBrand}
                onFocus={handleFocus}
                type={props.brand}
                isCollatingErrors={collateErrors}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div
                        ref={setRootNode}
                        className={`adyen-checkout__card-input ${styles['card-input__wrapper']} adyen-checkout__card-input--${props.fundingSource ??
                            'credit'}`}
                        role={collateErrors && 'form'}
                        aria-describedby={collateErrors ? errorFieldId : null}
                    >
                        <FieldToRender
                            // Extract exact props that we need to pass down
                            {...extractCardInputProps(props)}
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
                        />
                    </div>
                )}
            />
            {props.showPayButton &&
                props.payButton({ status, icon: getImage({ loadingContext: props.loadingContext, imageFolder: 'components/' })('lock') })}
        </Fragment>
    );
};

CardInput.defaultProps = defaultProps;

export default CardInput;
