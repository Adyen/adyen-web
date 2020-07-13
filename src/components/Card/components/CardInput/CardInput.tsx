import { Component, h } from 'preact';
import handlers from './handlers';
import Card from './components/Card';
import SecuredFieldsProvider from '~/components/internal/SecuredFields/SecuredFieldsProvider';
import Address from '~/components/internal/Address';
import OneClickCard from './components/OneClickCard';
import StoreDetails from '~/components/internal/StoreDetails';
import CardHolderName from './components/CardHolderName';
import LoadingWrapper from '../../../internal/LoadingWrapper/LoadingWrapper';
import KCPAuthentication from './components/KCPAuthentication';
import Installments from './components/Installments';
import defaultProps from './defaultProps';
import defaultStyles from './defaultStyles';
import styles from './CardInput.module.scss';
import getImage from '~/utils/get-image';
import './CardInput.scss';
// import { renderFormField } from '~/components/internal/FormFields';
// import Field from '~/components/internal/FormFields/Field';
import processBinLookupResponse from './processBinLookup';
import Language from '~/language/Language';
// import { CardElementProps } from '~/components/Card/Card';

interface CardInputProps {
    amount?: object;
    billingAddressAllowedCountries?: string[];
    billingAddressRequired?: boolean;
    billingAddressRequiredFields?: string[];
    brand?: string;
    data?: object;
    enableStoreDetails: boolean;
    hasCVC: boolean;
    hasHolderName: boolean;
    holderName?: boolean;
    holderNameRequired?: boolean;
    i18n?: Language;
    installmentOptions: object;
    koreanAuthenticationRequired?: boolean;
    loadingContext: string;
    payButton?: () => {};
    placeholders?: object;
    showPayButton?: boolean;
    storedPaymentMethodId?: string;
    styles?: object;
    onChange?: () => {};
    onSubmit?: () => {};
    onBrand?: () => {};
    onBinValue?: () => {};
}

interface CardInputState {
    additionalSelectElements: any[];
    additionalSelectType: string;
    additionalSelectValue: string;
    billingAddress: object;
    data?: object;
    errors?: object;
    focusedElement: string;
    hideCVCForBrand: boolean;
    isValid: boolean;
    status: string;
    valid?: object;
}

class CardInput extends Component<CardInputProps, CardInputState> {
    private validateCardInput;
    private handleOnBrand;
    private handleFocus;
    private handleAddress;
    private handleHolderName;
    private handleInstallments;
    private handleKCPAuthentication;
    private handleSecuredFieldsChange;
    private handleOnStoreDetails;
    private handleAdditionalDataSelection;
    private processBinLookupResponse;

    public state;
    public props;
    private setFocusOn;
    private updateStyles;
    private sfp;
    private billingAddressRef;
    private kcpAuthenticationRef;

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
            additionalSelectType: ''
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

        this.processBinLookupResponse = processBinLookupResponse;
    }

    public static defaultProps = defaultProps;

    public componentDidMount() {
        this.setFocusOn = this.sfp.setFocusOn;
        this.updateStyles = this.sfp.updateStyles;
    }

    componentDidUpdate(prevProps, prevState) {
        const { country: prevCountry, stateOrProvince: prevStateOrProvince } = prevState.billingAddress || {};
        const { country, stateOrProvince } = this.state.billingAddress || {};

        if (prevCountry !== country || prevStateOrProvince !== stateOrProvince) {
            this.validateCardInput();
        }
    }

    public componentWillUnmount() {
        this.sfp.destroy();
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
        this.sfp.showValidation();

        // Validate holderName
        if (this.props.holderNameRequired && !this.state.valid.holderName) {
            this.setState(prevState => ({
                errors: { ...prevState.errors, holderName: true }
            }));
        }

        // Validate Address
        if (this.billingAddressRef) this.billingAddressRef.showValidation();

        // Validate KCP authentication
        if (this.kcpAuthenticationRef) this.kcpAuthenticationRef.showValidation();
    }

    private handleSecuredFieldsRef = ref => {
        this.sfp = ref;
    };

    private handleBillingAddressRef = ref => {
        this.billingAddressRef = ref;
    };

    private handleKCPAuthenticationRef = ref => {
        this.kcpAuthenticationRef = ref;
    };

    render({ loadingContext, hasHolderName, hasCVC, i18n, installmentOptions, enableStoreDetails }, { status, hideCVCForBrand, focusedElement }) {
        const hasInstallments = !!Object.keys(installmentOptions).length;

        let isOneClick: boolean = this.props.storedPaymentMethodId ? true : false;
        if (this.props.oneClick === true) isOneClick = true; // In the Drop-in the oneClick status may already have been decided, so give that priority

        return (
            <SecuredFieldsProvider
                ref={this.handleSecuredFieldsRef}
                {...this.props}
                styles={{ ...defaultStyles, ...this.props.styles }}
                onChange={this.handleSecuredFieldsChange}
                onBrand={this.handleOnBrand}
                onFocus={this.handleFocus}
                type={this.props.brand}
                oneClick={isOneClick}
                render={({ setRootNode, setFocusOn }, sfpState) => (
                    <div ref={setRootNode} className={`adyen-checkout__card-input ${styles['card-input__wrapper']}`}>
                        {this.props.storedPaymentMethodId ? (
                            <LoadingWrapper status={sfpState.status}>
                                <OneClickCard
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
                                    />
                                )}
                            </LoadingWrapper>
                        ) : (
                            <LoadingWrapper status={sfpState.status}>
                                <Card
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

                                {this.props.koreanAuthenticationRequired && (
                                    <KCPAuthentication
                                        onFocusField={setFocusOn}
                                        focusedElement={focusedElement}
                                        encryptedPasswordState={{
                                            data: sfpState.encryptedPassword,
                                            valid: sfpState.valid ? sfpState.valid.encryptedPassword : false,
                                            errors: sfpState.errors ? sfpState.errors.encryptedPassword : false
                                        }}
                                        ref={this.handleKCPAuthenticationRef}
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
                                    />
                                )}

                                {this.props.billingAddressRequired && (
                                    <Address
                                        label="billingAddress"
                                        data={this.state.billingAddress}
                                        onChange={this.handleAddress}
                                        allowedCountries={this.props.billingAddressAllowedCountries}
                                        requiredFields={this.props.billingAddressRequiredFields}
                                        ref={this.handleBillingAddressRef}
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
