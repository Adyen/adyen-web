import { Component, h, createRef } from 'preact';
import Address from '../../../internal/Address';
import CardFields from './components/CardFields';
import CardHolderName from './components/CardHolderName';
import Installments from './components/Installments';
import KCPAuthentication from './components/KCPAuthentication';
import LoadingWrapper from '../../../internal/LoadingWrapper/LoadingWrapper';
import StoredCardFields from './components/StoredCardFields';
import SecuredFieldsProvider from '../../../../components/internal/SecuredFields/SecuredFieldsProvider';
import StoreDetails from '../../../internal/StoreDetails';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import getImage from '../../../../utils/get-image';
import handlers from './handlers';
import processBinLookup from './processBinLookup';
import styles from './CardInput.module.scss';
import { CardInputProps, CardInputState } from './types';
import './CardInput.scss';

class CardInput extends Component<CardInputProps, CardInputState> {
    private readonly validateCardInput;
    private readonly handleOnBrand;
    private readonly handleFocus;
    private readonly handleAddress;
    private readonly handleHolderName;
    private readonly handleInstallments;
    private readonly handleKCPAuthentication;
    private readonly handleSecuredFieldsChange;
    private readonly handleOnStoreDetails;
    private readonly handleAdditionalDataSelection;
    private readonly processBinLookup;

    public state;
    public props;
    private setFocusOn;
    private updateStyles;
    private handleUnsupportedCard;
    private sfp = createRef();
    private billingAddressRef = createRef();
    private kcpAuthenticationRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            status: 'ready',
            errors: {},
            valid: {
                ...(this.props.holderNameRequired && { holderName: false })
            },
            data: {
                ...(this.props.hasHolderName && {
                    holderName: this.props.holderName || this.props.data.holderName
                })
            },
            ...(this.props.billingAddressRequired && {
                billingAddress: {
                    ...this.props.data.billingAddress
                }
            }),
            isValid: false,
            hideCVCForBrand: false,
            focusedElement: '',
            additionalSelectElements: [],
            additionalSelectValue: '',
            additionalSelectType: '',
            issuingCountryCode: null
        };

        this.validateCardInput = handlers.validateCardInput.bind(this);
        this.handleOnBrand = handlers.handleOnBrand.bind(this);
        this.handleFocus = handlers.handleFocus.bind(this);
        this.handleAddress = handlers.handleAddress.bind(this);
        this.handleHolderName = handlers.handleHolderName.bind(this);
        this.handleInstallments = handlers.handleInstallments.bind(this);
        this.handleKCPAuthentication = handlers.handleKCPAuthentication.bind(this);
        this.handleSecuredFieldsChange = handlers.handleSecuredFieldsChange.bind(this);
        this.handleOnStoreDetails = handlers.handleOnStoreDetails.bind(this);
        this.handleAdditionalDataSelection = handlers.handleAdditionalDataSelection.bind(this);
        this.processBinLookup = processBinLookup.bind(this);
    }

    public static defaultProps = defaultProps;

    public componentDidMount() {
        this.setFocusOn = this.sfp.current.setFocusOn;
        this.updateStyles = this.sfp.current.updateStyles;
        this.handleUnsupportedCard = this.sfp.current.handleUnsupportedCard;
    }

    componentDidUpdate(prevProps, prevState) {
        const { country: prevCountry, stateOrProvince: prevStateOrProvince } = prevState.billingAddress || {};
        const { country, stateOrProvince } = this.state.billingAddress || {};

        if (prevCountry !== country || prevStateOrProvince !== stateOrProvince) {
            this.validateCardInput();
        }
    }

    public componentWillUnmount() {
        this.sfp.current.destroy();
        this.sfp = null;
    }

    public getChildContext() {
        return { i18n: this.props.i18n };
    }

    public setStatus(status) {
        this.setState({ status });
    }

    public resetAdditionalSelectState() {
        this.setState({
            additionalSelectElements: [],
            additionalSelectValue: '',
            additionalSelectType: ''
        });
    }

    public showValidation() {
        // Validate SecuredFields
        this.sfp.current.showValidation();

        // Validate holderName
        if (this.props.holderNameRequired && !this.state.valid.holderName) {
            this.setState(prevState => ({
                errors: { ...prevState.errors, holderName: true }
            }));
        }

        // Validate Address
        if (this.billingAddressRef?.current) this.billingAddressRef.current.showValidation();

        // Validate KCP authentication
        if (this.kcpAuthenticationRef?.current) this.kcpAuthenticationRef.current.showValidation();
    }

    public processBinLookupResponse(data) {
        const issuingCountryCode = data?.issuingCountryCode ? data.issuingCountryCode.toLowerCase() : null;

        this.setState({ issuingCountryCode }, () => {
            this.processBinLookup(data);
        });
    }

    render(
        { countryCode, loadingContext, hasHolderName, hasCVC, installmentOptions, enableStoreDetails, showInstallmentAmounts },
        { status, hideCVCForBrand, focusedElement, issuingCountryCode }
    ) {
        const hasInstallments = !!Object.keys(installmentOptions).length;

        // In the Drop-in the oneClick status may already have been decided, so give that priority
        const isOneClick = this.props.oneClick || !!this.props.storedPaymentMethodId;

        // If issuingCountryCode is set or the merchant defined countryCode is 'KR'
        const isKorea = issuingCountryCode ? issuingCountryCode === 'kr' : countryCode === 'kr';

        const showAmountsInInstallments = showInstallmentAmounts ?? true;

        return (
            <SecuredFieldsProvider
                ref={this.sfp}
                {...this.props}
                styles={{ ...defaultStyles, ...this.props.styles }}
                koreanAuthenticationRequired={this.props.configuration.koreanAuthenticationRequired}
                hasKoreanFields={!!(this.props.configuration.koreanAuthenticationRequired && this.props.countryCode === 'kr')}
                onChange={this.handleSecuredFieldsChange}
                onBrand={this.handleOnBrand}
                onFocus={this.handleFocus}
                type={this.props.brand}
                oneClick={isOneClick}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div ref={setRootNode} className={`adyen-checkout__card-input ${styles['card-input__wrapper']}`}>
                        {this.props.storedPaymentMethodId ? (
                            <LoadingWrapper status={sfpState.status}>
                                <StoredCardFields
                                    {...this.props}
                                    cvcRequired={sfpState.cvcRequired}
                                    errors={sfpState.errors}
                                    brand={sfpState.brand}
                                    hasCVC={hasCVC}
                                    hideCVCForBrand={hideCVCForBrand}
                                    onFocusField={setFocusOn}
                                    focusedElement={focusedElement}
                                    status={sfpState.status}
                                    valid={sfpState.valid}
                                />

                                {hasInstallments && (
                                    <Installments
                                        amount={this.props.amount}
                                        brand={sfpState.brand}
                                        installmentOptions={installmentOptions}
                                        onChange={this.handleInstallments}
                                        type={showAmountsInInstallments ? 'amount' : 'months'}
                                    />
                                )}
                            </LoadingWrapper>
                        ) : (
                            <LoadingWrapper status={sfpState.status}>
                                <CardFields
                                    {...this.props}
                                    brand={sfpState.brand}
                                    focusedElement={focusedElement}
                                    onFocusField={setFocusOn}
                                    hasCVC={hasCVC}
                                    hideCVCForBrand={hideCVCForBrand}
                                    errors={sfpState.errors}
                                    valid={sfpState.valid}
                                    cvcRequired={sfpState.cvcRequired}
                                    dualBrandingElements={this.state.additionalSelectElements.length > 0 && this.state.additionalSelectElements}
                                    dualBrandingChangeHandler={this.handleAdditionalDataSelection}
                                    dualBrandingSelected={this.state.additionalSelectValue}
                                />

                                {hasHolderName && (
                                    <CardHolderName
                                        required={this.props.holderNameRequired}
                                        placeholder={this.props.placeholders.holderName}
                                        value={this.state.data.holderName}
                                        error={!!this.state.errors.holderName}
                                        isValid={!!this.state.valid.holderName}
                                        onChange={this.handleHolderName}
                                    />
                                )}

                                {this.props.configuration.koreanAuthenticationRequired && isKorea && (
                                    <KCPAuthentication
                                        onFocusField={setFocusOn}
                                        focusedElement={focusedElement}
                                        encryptedPasswordState={{
                                            data: sfpState.encryptedPassword,
                                            valid: sfpState.valid ? sfpState.valid.encryptedPassword : false,
                                            errors: sfpState.errors ? sfpState.errors.encryptedPassword : false
                                        }}
                                        ref={this.kcpAuthenticationRef}
                                        onChange={this.handleKCPAuthentication}
                                    />
                                )}

                                {enableStoreDetails && <StoreDetails onChange={this.handleOnStoreDetails} />}

                                {hasInstallments && (
                                    <Installments
                                        amount={this.props.amount}
                                        brand={sfpState.brand}
                                        installmentOptions={installmentOptions}
                                        onChange={this.handleInstallments}
                                        type={showAmountsInInstallments ? 'amount' : 'months'}
                                    />
                                )}

                                {this.props.billingAddressRequired && (
                                    <Address
                                        label="billingAddress"
                                        data={this.state.billingAddress}
                                        onChange={this.handleAddress}
                                        allowedCountries={this.props.billingAddressAllowedCountries}
                                        requiredFields={this.props.billingAddressRequiredFields}
                                        ref={this.billingAddressRef}
                                    />
                                )}
                            </LoadingWrapper>
                        )}

                        {this.props.showPayButton &&
                            this.props.payButton({ status, icon: getImage({ loadingContext, imageFolder: 'components/' })('lock') })}
                    </div>
                )}
            />
        );
    }
}

export default CardInput;
