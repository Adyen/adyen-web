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
import SocialSecurityNumberBrazil from '../../../Boleto/components/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
import StoreDetails from '../../../internal/StoreDetails';
import Address from '../../../internal/Address/Address';
import getImage from '../../../../utils/get-image';
import { CardInputProps, CardInputValidState, CardInputErrorState, CardInputDataState } from './types';
import { CVC_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { cardInputFormatters, cardInputValidationRules, getRuleByNameAndMode } from './validate';
import CIExtensions from './extensions';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import CardHolderName from './components/CardHolderName';
import useForm from '../../../../utils/useForm';

function CardInput(props: CardInputProps) {
    const sfp = useRef(null);
    const billingAddressRef = useRef(null);

    if (process.env.NODE_ENV === 'development') this.sfp = sfp;

    /**
     * STATE HOOKS
     */
    const [errors, setErrors] = useState<CardInputErrorState>({});
    const [valid, setValid] = useState<CardInputValidState>({
        ...(props.holderNameRequired && { holderName: false })
    });
    const [data, setData] = useState<CardInputDataState>({
        ...(props.hasHolderName && { holderName: props.data.holderName ?? '' })
    });

    const [focusedElement, setFocusedElement] = useState('');
    const [isSfpValid, setIsSfpValid] = useState(false);
    const [hideDateForBrand, setHideDateForBrand] = useState(false);
    const [cvcPolicy, setCvcPolicy] = useState(CVC_POLICY_REQUIRED);
    const [issuingCountryCode, setIssuingCountryCode] = useState(null);

    const [additionalSelectElements, setAdditionalSelectElements] = useState([]);
    const [additionalSelectValue, setAdditionalSelectValue] = useState('');

    const [storePaymentMethod, setStorePaymentMethod] = useState(false);
    const [billingAddress, setBillingAddress] = useState(props.billingAddressRequired ? props.data.billingAddress : null);
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
    const handleFocus = (e: CbObjOnFocus) => {
        setFocusedElement(e.currentFocusObject);
        e.focus === true ? props.onFocus(e) : props.onBlur(e);
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
        setHideDateForBrand(sfState.hideDateForBrand);
    };

    // Farm the handlers for binLookup related functionality out to another 'extensions' file
    const extensions = useMemo(
        () =>
            CIExtensions(
                props,
                { sfp },
                { additionalSelectElements, setAdditionalSelectElements, setAdditionalSelectValue, issuingCountryCode, setIssuingCountryCode }
            ),
        [additionalSelectElements, issuingCountryCode]
    );

    /**
     * EXPECTED METHODS ON CARD.THIS
     */
    this.showValidation = () => {
        // Validate SecuredFields
        sfp.current.showValidation();

        // Validates holderName & SSN & KCP (taxNumber)
        triggerValidation();

        // Validate Address
        if (billingAddressRef?.current) billingAddressRef.current.showValidation();
    };

    this.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        extensions.processBinLookup(binLookupResponse, isReset);
    };

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
        console.log('### CardInputHook::formData:: ', formData);
        console.log('### CardInputHook::formValid:: ', formValid);
        console.log('### CardInputHook::formErrors:: ', formErrors);

        setData({ ...data, holderName: formData.holderName ?? '', taxNumber: formData.taxNumber });

        setSocialSecurityNumber(formData.socialSecurityNumber);

        setBillingAddress({ ...billingAddress, ...formData.billingAddress }); // TODO test

        setValid({
            ...valid,
            holderName: props.holderNameRequired ? formValid.holderName : true,
            // Setting value to false if it's falsy keeps in line with existing, expected behaviour
            // - but there is an argument to allow 'undefined' as a value to indicate the non-presence of the field
            socialSecurityNumber: formValid.socialSecurityNumber ? formValid.socialSecurityNumber : false,
            taxNumber: formValid.taxNumber ? formValid.taxNumber : false,
            billingAddress: formValid.billingAddress ? formValid.billingAddress : false
        });

        // Errors
        setErrors({
            ...errors,
            holderName: props.holderNameRequired && !!formErrors.holderName ? formErrors.holderName : null,
            socialSecurityNumber: showBrazilianSSN && !!formErrors.socialSecurityNumber ? formErrors.socialSecurityNumber : null,
            taxNumber: showKCP && !!formErrors.taxNumber ? formErrors.taxNumber : null,
            billingAddress: props.billingAddressRequired && !!formErrors.billingAddress ? formErrors.billingAddress : null
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

        props.onChange({
            data,
            valid,
            errors,
            isValid,
            billingAddress,
            additionalSelectValue,
            storePaymentMethod,
            socialSecurityNumber,
            installments
        });
    }, [data, valid, errors, additionalSelectValue, storePaymentMethod, installments]);

    /**
     * RENDER
     */
    const cardHolderField = (
        <CardHolderName
            required={props.holderNameRequired}
            placeholder={props.placeholders.holderName}
            value={data.holderName}
            error={!!errors.holderName}
            isValid={!!valid.holderName}
            onChange={handleChangeFor('holderName', 'blur')}
            onInput={handleChangeFor('holderName', 'input')}
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
            render={({ setRootNode, setFocusOn }, sfpState) => (
                <div
                    ref={setRootNode}
                    className={`adyen-checkout__card-input ${styles['card-input__wrapper']} adyen-checkout__card-input--${props.fundingSource ??
                        'credit'}`}
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
                            {props.hasHolderName && props.positionHolderNameOnTop && cardHolderField}

                            <CardFields
                                {...props}
                                brand={sfpState.brand}
                                focusedElement={focusedElement}
                                onFocusField={setFocusOn}
                                hasCVC={props.hasCVC}
                                cvcPolicy={cvcPolicy}
                                hideDateForBrand={hideDateForBrand}
                                errors={sfpState.errors}
                                valid={sfpState.valid}
                                dualBrandingElements={additionalSelectElements.length > 0 && additionalSelectElements}
                                dualBrandingChangeHandler={extensions.handleDualBrandSelection}
                                dualBrandingSelected={additionalSelectValue}
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
