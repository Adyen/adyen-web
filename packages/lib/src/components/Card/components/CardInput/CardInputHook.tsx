import { h } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import SecuredFieldsProvider, { SFPState } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import styles from './CardInput.module.scss';
import LoadingWrapper from '../../../internal/LoadingWrapper';
// import StoredCardFields from './components/StoredCardFields';
// import Installments from './components/Installments';
import CardFields from './components/CardFields';
// import KCPAuthentication from './components/KCPAuthentication';
// import SocialSecurityNumberBrazil from '../../../Boleto/components/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil';
// import StoreDetails from '../../../internal/StoreDetails';
// import Address from '../../../internal/Address/Address';
import getImage from '../../../../utils/get-image';
import { CardInputProps, CardInputStateValid, CardInputStateError, CardInputStateData, CardInputState } from './types';
import { CVC_POLICY_REQUIRED } from '../../../internal/SecuredFields/lib/configuration/constants';
import { BinLookupResponse, BrandObject } from '../../types';
import { validateHolderName } from './validate';
// import processBinLookupHook from './processBinLookupHook';
import CIExtensions from './extensions';
import { CbObjOnFocus } from '../../../internal/SecuredFields/lib/types';

function CardInput(props: CardInputProps) {
    const sfp = useRef(null);

    // console.log('### CardInputHook::CardInput:: props=', props);

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

    const [billingAddress, setBillingAddress] = useState(props.billingAddressRequired ? props.data.billingAddress : null);

    const extensions = useMemo(
        () => CIExtensions(props, { sfp }, { additionalSelectElements, setAdditionalSelectElements, setAdditionalSelectValue, issuingCountryCode }),
        [additionalSelectElements, issuingCountryCode]
    );

    /**
     * HANDLERS
     */
    const handleFocus = (e: CbObjOnFocus) => {
        setFocusedElement(e.currentFocusObject);

        if (e.focus === true) {
            props.onFocus(e);
        } else {
            props.onBlur(e);
        }
    };

    const handleSecuredFieldsChange = (newState: SFPState): void => {
        console.log('### CardInputHook::handleSecuredFieldsChange:: newState', newState);
        const sfState = newState;

        const tempHolderName = sfState.autoCompleteName && props.hasHolderName ? sfState.autoCompleteName : data.holderName;

        setData({ ...data, ...sfState.data, holderName: tempHolderName });
        setErrors({ ...errors, ...sfState.errors });
        setValid({
            ...valid,
            ...sfState.valid,
            holderName: validateHolderName(tempHolderName, props.holderNameRequired)
        });

        setIsSfpValid(sfState.isSfpValid);
        setCvcPolicy(sfState.cvcPolicy);
        // setShowSocialSecurityNumber(sfState.showSocialSecurityNumber);
        setHideDateForBrand(sfState.hideDateForBrand);
        // setBrand(sfState.brand);
    };

    /**
     * Handler for the icons added in response to the /binLookup call
     */
    // const handleAdditionalDataSelection = (e: Event): void => {
    //     const value: string = (e.target as HTMLLIElement).getAttribute('data-value');
    //
    //     setAdditionalSelectValue(value);
    //
    //     // Find the brandObject with the matching brand value and place into an array
    //     const brandObjArr: BrandObject[] = additionalSelectElements.reduce((acc, item) => {
    //         if (item.brandObject.brand === value) {
    //             acc.push(item.brandObject);
    //         }
    //         return acc;
    //     }, []);
    //
    //     // Pass brand object into SecuredFields
    //     sfp.current.processBinLookupResponse({
    //         issuingCountryCode,
    //         supportedBrands: brandObjArr
    //     });
    // };

    /**
     * EXPECTED METHODS ON CARD.THIS
     */
    this.showValidation = () => {
        // Validate SecuredFields
        sfp.current.showValidation();

        // Validate holderName
        // if (props.holderNameRequired && !valid.holderName) {
        //     setErrors({ ...errors, holderName: true });
        // }
        //
        // // Validate Address
        // if (billingAddressRef.current) billingAddressRef.current.showValidation();
    };

    this.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        const issuingCountryCode = binLookupResponse?.issuingCountryCode ? binLookupResponse.issuingCountryCode.toLowerCase() : null;

        setIssuingCountryCode(issuingCountryCode);

        // processBinLookupHook({ binLookupResponse, isReset, props, sfp, setAdditionalSelectElements, setAdditionalSelectValue });
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

    // Run when state.data, -errors or -valid change
    useEffect(() => {
        // Validate whole component i.e holderName + securedFields + address
        const holderNameValid = validateHolderName(data.holderName, props.holderNameRequired);
        const billingAddressValid = props.billingAddressRequired ? Boolean(valid.billingAddress) : true;

        const isValid = isSfpValid; // && holderNameValid && billingAddressValid;

        console.log('\n### CardInputHook:::: useEffect data=', data);
        console.log('### CardInputHook:::: useEffect valid=', valid);
        console.log('### CardInputHook:::: useEffect errors=', errors);

        props.onChange({ data, valid, errors, isValid, billingAddress, additionalSelectValue });

        console.log('### CardInputHook::useEffect:: card.formatData().paymentMethod.brand', window['card'].formatData().paymentMethod.brand);
    }, [data, valid, errors, additionalSelectValue]);

    return (
        <SecuredFieldsProvider
            ref={sfp}
            {...props}
            styles={{ ...defaultStyles, ...props.styles }}
            // koreanAuthenticationRequired={configuration.koreanAuthenticationRequired}
            // hasKoreanFields={!!(configuration.koreanAuthenticationRequired && countryCode === 'kr')}
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
                    {/*{this.props.storedPaymentMethodId ? (*/}
                    {/*    <LoadingWrapper status={sfpState.status}>*/}
                    {/*        <StoredCardFields*/}
                    {/*            {...this.props}*/}
                    {/*            errors={sfpState.errors}*/}
                    {/*            brand={sfpState.brand}*/}
                    {/*            hasCVC={hasCVC}*/}
                    {/*            cvcPolicy={cvcPolicy}*/}
                    {/*            onFocusField={setFocusOn}*/}
                    {/*            focusedElement={focusedElement}*/}
                    {/*            status={sfpState.status}*/}
                    {/*            valid={sfpState.valid}*/}
                    {/*        />*/}

                    {/*        {hasInstallments && (*/}
                    {/*            <Installments*/}
                    {/*                amount={this.props.amount}*/}
                    {/*                brand={sfpState.brand}*/}
                    {/*                installmentOptions={installmentOptions}*/}
                    {/*                onChange={this.handleInstallments}*/}
                    {/*                type={showAmountsInInstallments ? 'amount' : 'months'}*/}
                    {/*            />*/}
                    {/*        )}*/}
                    {/*    </LoadingWrapper>*/}
                    {/*) : (*/}
                    <LoadingWrapper status={sfpState.status}>
                        {/*{hasHolderName && positionHolderNameOnTop && cardHolderField}*/}

                        <CardFields
                            {...props}
                            brand={sfpState.brand}
                            focusedElement={focusedElement} // from state
                            onFocusField={setFocusOn}
                            hasCVC={props.hasCVC} // from props
                            cvcPolicy={cvcPolicy} // from state
                            hideDateForBrand={hideDateForBrand} // from state
                            errors={sfpState.errors}
                            valid={sfpState.valid}
                            dualBrandingElements={additionalSelectElements.length > 0 && additionalSelectElements}
                            dualBrandingChangeHandler={extensions.handleAdditionalDataSelection}
                            dualBrandingSelected={additionalSelectValue}
                        />

                        {/*{hasHolderName && !positionHolderNameOnTop && cardHolderField}*/}

                        {/*{configuration.koreanAuthenticationRequired && isKorea && (*/}
                        {/*    <KCPAuthentication*/}
                        {/*        onFocusField={setFocusOn}*/}
                        {/*        focusedElement={focusedElement}*/}
                        {/*        encryptedPasswordState={{*/}
                        {/*            data: sfpState.encryptedPassword,*/}
                        {/*            valid: sfpState.valid ? sfpState.valid.encryptedPassword : false,*/}
                        {/*            errors: sfpState.errors ? sfpState.errors.encryptedPassword : false*/}
                        {/*        }}*/}
                        {/*        ref={this.kcpAuthenticationRef}*/}
                        {/*        onChange={this.handleKCPAuthentication}*/}
                        {/*    />*/}
                        {/*)}*/}

                        {/*{showBrazilianSSN && (*/}
                        {/*    <div className="adyen-checkout__card__socialSecurityNumber">*/}
                        {/*        <SocialSecurityNumberBrazil*/}
                        {/*            onChange={e => this.handleCPF(e, true)}*/}
                        {/*            onInput={e => this.handleCPF(e)}*/}
                        {/*            error={this.state.errors?.socialSecurityNumber}*/}
                        {/*            valid={this.state.valid?.socialSecurityNumber}*/}
                        {/*            data={this.state.socialSecurityNumber}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{this.props.enableStoreDetails && <StoreDetails onChange={this.handleOnStoreDetails} />}*/}

                        {/*{hasInstallments && (*/}
                        {/*    <Installments*/}
                        {/*        amount={this.props.amount}*/}
                        {/*        brand={sfpState.brand}*/}
                        {/*        installmentOptions={installmentOptions}*/}
                        {/*        onChange={this.handleInstallments}*/}
                        {/*        type={showAmountsInInstallments ? 'amount' : 'months'}*/}
                        {/*    />*/}
                        {/*)}*/}

                        {/*{this.props.billingAddressRequired && (*/}
                        {/*    <Address*/}
                        {/*        label="billingAddress"*/}
                        {/*        data={this.state.billingAddress}*/}
                        {/*        onChange={this.handleAddress}*/}
                        {/*        allowedCountries={this.props.billingAddressAllowedCountries}*/}
                        {/*        requiredFields={this.props.billingAddressRequiredFields}*/}
                        {/*        ref={this.billingAddressRef}*/}
                        {/*    />*/}
                        {/*)}*/}
                    </LoadingWrapper>
                    {/*)}*/}

                    {props.showPayButton &&
                        props.payButton({ status, icon: getImage({ loadingContext: props.loadingContext, imageFolder: 'components/' })('lock') })}
                </div>
            )}
        />
    );
}

CardInput.defaultProps = defaultProps;

export default CardInput;
