import { h } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import SecuredFieldsProvider, { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import styles from './CardInput.module.scss';
import LoadingWrapper from '../../../internal/LoadingWrapper';
import StoredCardFields from './components/StoredCardFields';
import Installments from './components/Installments';
import CardFields from './components/CardFields';
import KCPAuthentication from './components/KCPAuthentication';
import SocialSecurityNumberBrazil from '../../../Boleto/components/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
import StoreDetails from '../../../internal/StoreDetails';
import Address from '../../../internal/Address/Address';
import getImage from '../../../../utils/get-image';
import { CardInputProps, CardInputStateValid, CardInputStateError, CardInputStateData } from './types';
import { CVC_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse } from '../../types';
import { validateHolderName } from './validate';
import CIExtensions from './extensions';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';
import CardHolderName from './components/CardHolderName';
import { formatCPFCNPJ } from '../../../Boleto/components/SocialSecurityNumberBrazil/utils';
import validateSSN from '../../../Boleto/components/SocialSecurityNumberBrazil/validate';

function CardInput(props: CardInputProps) {
    const sfp = useRef(null);
    const kcpAuthenticationRef = useRef(null);
    const billingAddressRef = useRef(null);

    /**
     * STATE HOOKS
     */
    const [errors, setErrors] = useState<CardInputStateError>({});
    const [valid, setValid] = useState<CardInputStateValid>({
        ...(props.holderNameRequired && { holderName: false })
    });
    const [data, setData] = useState<CardInputStateData>({
        ...(props.hasHolderName && { holderName: props.holderName || props.data.holderName })
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
    const hasInstallments = !!Object.keys(props.installmentOptions).length;
    const showAmountsInInstallments = props.showInstallmentAmounts ?? true;

    const cardCountryCode: string = issuingCountryCode ?? props.countryCode;
    const isKorea = cardCountryCode === 'kr'; // If issuingCountryCode or the merchant defined countryCode is set to 'kr'

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

    const handleHolderName = (e: Event): void => {
        const holderName = (e.target as HTMLInputElement).value;

        setData({ ...data, holderName });
        setErrors({ ...errors, holderName: !validateHolderName(holderName, props.holderNameRequired, false) });
        setValid({
            ...valid,
            holderName: validateHolderName(holderName, props.holderNameRequired)
        });
    };

    const handleAddress = address => {
        setBillingAddress({ ...billingAddress, ...address.data });
        setValid({ ...valid, billingAddress: address.isValid });
    };

    const handleKCPAuthentication = (kcpData: object, kcpValid: object): void => {
        setData({ ...data, ...kcpData });
        setValid({ ...valid, ...kcpValid });
    };

    const handleCPF = (e: Event, validate = false): void => {
        const socialSecurityNumberStr = formatCPFCNPJ((e.target as HTMLInputElement).value);
        const isValid = validateSSN(socialSecurityNumberStr);

        setSocialSecurityNumber(socialSecurityNumberStr);
        setValid({ ...valid, socialSecurityNumber: isValid });
        setErrors({ ...errors, socialSecurityNumber: validate && !isValid });
    };

    const handleSecuredFieldsChange = (sfState: SFPState, who): void => {
        console.log('### CardInputHook::handleSecuredFieldsChange:: WHO', who);
        console.log('### CardInputHook::handleSecuredFieldsChange:: sfState', sfState);

        const tempHolderName = sfState.autoCompleteName && props.hasHolderName ? sfState.autoCompleteName : data.holderName;

        // Needed because of strange timing/lifecycle/render issue now we are using hooks.
        // The 'componentWillUnmount' useEffect in KCPAuthentication which should trigger handleKCPAuthentication, passing it
        // values to clear the taxNumber field from the data & valid objects, is failing to reset these fields when the
        // new data & valid objects are generated in our 'componentDidUpdate' useEffect, below.
        // Although the correct objects are received in handleKCPAuthentication, curiously the data & valid objects (...data) are empty.
        const kcpFieldsRemoved = !sfState.hasKoreanFields && props.configuration.koreanAuthenticationRequired ? true : false;

        setData({ ...data, ...sfState.data, holderName: tempHolderName, ...(kcpFieldsRemoved && { taxNumber: undefined }) });
        setErrors({ ...errors, ...sfState.errors });
        setValid({
            ...valid,
            ...sfState.valid,
            holderName: validateHolderName(tempHolderName, props.holderNameRequired),
            ...(kcpFieldsRemoved && { taxNumber: false })
        });

        setIsSfpValid(sfState.isSfpValid);
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

        // Validate holderName
        const holderNameInError = props.holderNameRequired && !valid.holderName ? true : false;

        // Validate SSN
        const ssnInError =
            ((showSocialSecurityNumber && props.configuration.socialSecurityNumberMode === 'auto') ||
                props.configuration.socialSecurityNumberMode === 'show') &&
            !valid.socialSecurityNumber
                ? true
                : false;

        // Set holderName & SSN errors
        setErrors({ ...errors, ...(ssnInError && { socialSecurityNumber: true }), ...(holderNameInError && { holderName: true }) });

        // Validate Address
        if (billingAddressRef?.current) billingAddressRef.current.showValidation();

        // Validate KCP authentication
        if (kcpAuthenticationRef?.current) kcpAuthenticationRef.current.showValidation();
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

    useEffect(() => {
        console.log('### CardInputHook:::: useEffect data=', data);
        console.log('### CardInputHook:::: useEffect valid=', valid);
        console.log('### CardInputHook:::: useEffect errors=', errors);

        const { configuration, countryCode, billingAddressRequired, holderNameRequired } = props;
        const holderNameValid: boolean = validateHolderName(data.holderName, holderNameRequired);
        const sfpValid: boolean = isSfpValid;
        const addressValid: boolean = billingAddressRequired ? valid.billingAddress : true;

        const cardCountryCode: string = issuingCountryCode ?? countryCode;

        const koreanAuthentication: boolean =
            configuration.koreanAuthenticationRequired && cardCountryCode === 'kr' ? !!valid.taxNumber && !!valid.encryptedPassword : true;

        const socialSecurityNumberRequired: boolean =
            (showSocialSecurityNumber && configuration.socialSecurityNumberMode === 'auto') || // auto mode (Bin Lookup)
            configuration.socialSecurityNumberMode === 'show'; // require ssn manually
        const socialSecurityNumberValid: boolean = socialSecurityNumberRequired ? !!valid.socialSecurityNumber : true;

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
            onChange={handleHolderName}
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

                            {props.configuration.koreanAuthenticationRequired && isKorea && (
                                <KCPAuthentication
                                    onFocusField={setFocusOn}
                                    focusedElement={focusedElement}
                                    encryptedPasswordState={{
                                        data: sfpState.encryptedPassword,
                                        valid: sfpState.valid ? sfpState.valid.encryptedPassword : false,
                                        errors: sfpState.errors ? sfpState.errors.encryptedPassword : false
                                    }}
                                    ref={kcpAuthenticationRef}
                                    onChange={handleKCPAuthentication}
                                />
                            )}

                            {showBrazilianSSN && (
                                <div className="adyen-checkout__card__socialSecurityNumber">
                                    <SocialSecurityNumberBrazil
                                        onChange={e => handleCPF(e, true)}
                                        onInput={e => handleCPF(e)}
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
