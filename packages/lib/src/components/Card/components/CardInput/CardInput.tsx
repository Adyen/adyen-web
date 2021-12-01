import { h } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import SecuredFieldsProvider, { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import styles from './CardInput.module.scss';
import './CardInput.scss';
import LoadingWrapper from '../../../internal/LoadingWrapper';
import StoredCardFields from './components/StoredCardFields';
import Installments from './components/Installments';
import CardFields from './components/CardFields';
import KCPAuthentication from './components/KCPAuthentication';
import SocialSecurityNumberBrazil from '../../../internal/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
import StoreDetails from '../../../internal/StoreDetails';
import Address from '../../../internal/Address/Address';
import getImage from '../../../../utils/get-image';
import { CardInputProps, CardInputValidState, CardInputErrorState, CardInputDataState } from './types';
import { ALL_SECURED_FIELDS, CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { cardInputFormatters, cardInputValidationRules, getRuleByNameAndMode } from './validate';
import CIExtensions from '../../../internal/SecuredFields/binLookup/extensions';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import CardHolderName from './components/CardHolderName';
import useForm from '../../../../utils/useForm';
import { ErrorPanel, ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import { getLayout, sortErrorsForPanel } from './utils';
import { selectOne } from '../../../internal/SecuredFields/lib/utilities/dom';
import { AddressData } from '../../../../types';
import Specifications from '../../../internal/Address/Specifications';
import { ValidationRuleResult } from '../../../../utils/Validator/Validator';

function CardInput(props: CardInputProps) {
    const sfp = useRef(null);
    const billingAddressRef = useRef(null);
    const isValidating = useRef(false);

    const errorFieldId = 'creditCardErrors';

    const { collateErrors = true, moveFocus = false, showPanel = false } = props.SRConfig;

    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    // Creates access to sfp so we can call functionality on it (like handleOnAutoComplete) directly from the console. Used for testing.
    if (process.env.NODE_ENV === 'development') this.sfp = sfp;

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
    const [issuingCountryCode, setIssuingCountryCode] = useState(null);

    const [dualBrandSelectElements, setDualBrandSelectElements] = useState([]);
    const [selectedBrandValue, setSelectedBrandValue] = useState('');

    const [storePaymentMethod, setStorePaymentMethod] = useState(false);
    const [billingAddress, setBillingAddress] = useState<AddressData>(props.billingAddressRequired ? props.data.billingAddress : null);
    const [showSocialSecurityNumber, setShowSocialSecurityNumber] = useState(false);
    const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
    const [installments, setInstallments] = useState({ value: null });

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
    const handleFocus = (e: CbObjOnFocus) => {
        setFocusedElement(e.currentFocusObject);
        e.focus === true ? props.onFocus(e) : props.onBlur(e);
    };

    // Callback for ErrorPanel
    const handleErrorPanelFocus = (errors: ErrorPanelObj) => {
        if (isValidating.current) {
            const who = errors.fieldList[0];

            // If not a securedField - find field and set focus on it
            if (!ALL_SECURED_FIELDS.includes(who)) {
                let nameVal = who;

                // We have an exception with the kcp taxNumber where the name of the field ('kcpTaxNumberOrDOB') doesn't match
                // the value by which the field is referred to internally ('taxNumber')
                if (nameVal === 'taxNumber') nameVal = 'kcpTaxNumberOrDOB';

                if (nameVal === 'country' || nameVal === 'stateOrProvince') {
                    // Set focus on dropdown
                    const field = selectOne(sfp.current.rootNode, `.adyen-checkout__field--${nameVal} .adyen-checkout__dropdown__button`);
                    field?.focus();
                } else {
                    // Set focus on input
                    const field = selectOne(sfp.current.rootNode, `[name="${nameVal}"]`);
                    field?.focus();
                }
            } else {
                // Is a securedField - so it has it's own focus procedures
                handleFocus({ currentFocusObject: who } as CbObjOnFocus);
                this.setFocusOn(who);
            }
            isValidating.current = false;
        }
    };

    const handleOnStoreDetails = (storeDetails: boolean): void => {
        setStorePaymentMethod(storeDetails);
    };

    const handleInstallments = (installments): void => {
        setInstallments(installments);
    };

    const handleAddress = address => {
        setFormData('billingAddress', address.data);
        setFormValid('billingAddress', address.isValid);
        setFormErrors('billingAddress', address.errors);
    };

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
    this.showValidation = () => {
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

    this.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        extensions.processBinLookup(binLookupResponse, isReset);
    };

    this.setStatus = setStatus;

    /**
     * EFFECT HOOKS
     */
    useEffect(() => {
        // componentDidMount
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;
        this.handleUnsupportedCard = sfp.current.handleUnsupportedCard;

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
        // console.log('### CardInput::sortedMergedErrors:: ', sortedMergedErrors);

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
    const cardHolderField = (
        <CardHolderName
            required={props.holderNameRequired}
            placeholder={props.placeholders.holderName}
            value={formData.holderName}
            error={!!formErrors.holderName && props.holderNameRequired}
            isValid={!!formValid.holderName}
            onChange={handleChangeFor('holderName', 'blur')}
            onInput={handleChangeFor('holderName', 'input')}
            collateErrors={collateErrors}
        />
    );

    const getInstallmentsComp = brand => (
        <Installments
            amount={props.amount}
            brand={brand}
            installmentOptions={props.installmentOptions}
            onChange={handleInstallments}
            type={showAmountsInInstallments ? 'amount' : 'months'}
        />
    );

    return (
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
                    {props.storedPaymentMethodId ? (
                        <LoadingWrapper status={sfpState.status}>
                            <StoredCardFields
                                {...props}
                                errors={sfpState.errors}
                                brand={sfpState.brand}
                                hasCVC={props.hasCVC}
                                cvcPolicy={cvcPolicy}
                                onFocusField={setFocusOn}
                                focusedElement={focusedElement}
                                status={sfpState.status}
                                valid={sfpState.valid}
                            />

                            {hasInstallments && getInstallmentsComp(sfpState.brand)}
                        </LoadingWrapper>
                    ) : (
                        <LoadingWrapper status={sfpState.status}>
                            {collateErrors && (
                                <ErrorPanel
                                    id={errorFieldId}
                                    heading={props.i18n.get('errorPanel.title')}
                                    errors={mergedSRErrors}
                                    callbackFn={moveFocus ? handleErrorPanelFocus : null}
                                    showPanel={showPanel}
                                />
                            )}

                            {props.hasHolderName && props.positionHolderNameOnTop && cardHolderField}

                            <CardFields
                                {...props}
                                brand={sfpState.brand}
                                brandsConfiguration={this.props.brandsConfiguration}
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
                                collateErrors={collateErrors}
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
                                    collateErrors={collateErrors}
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
                                        collateErrors={collateErrors}
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
                                    collateErrors={collateErrors}
                                />
                            )}
                        </LoadingWrapper>
                    )}

                    {props.showPayButton &&
                        props.payButton({ status, icon: getImage({ loadingContext: props.loadingContext, imageFolder: 'components/' })('lock') })}
                </div>
            )}
        />
    );
}

CardInput.defaultProps = defaultProps;

export default CardInput;
