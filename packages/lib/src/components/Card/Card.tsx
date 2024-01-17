import { h } from 'preact';
import { UIElement } from '../UIElement';
import CardInput from './components/CardInput';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import { BinLookupResponse, CardElementData, CardElementProps } from './types';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CbObjOnBinLookup } from '../internal/SecuredFields/lib/types';
import { reject } from '../internal/SecuredFields/utils';
import { hasValidInstallmentsObject } from './components/CardInput/utils';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import ClickToPayWrapper from './components/ClickToPayWrapper';
import { PayButtonFunctionProps, UIElementStatus } from '../types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import PayButton from '../internal/PayButton';
import { ANALYTICS_FOCUS_STR, ANALYTICS_UNFOCUS_STR, ANALYTICS_VALIDATION_ERROR_STR } from '../../core/Analytics/constants';
import { ALL_SECURED_FIELDS, ENCRYPTED } from '../internal/SecuredFields/lib/configuration/constants';
import { camelCaseToSnakeCase } from '../../utils/textUtils';

export class CardElement extends UIElement<CardElementProps> {
    public static type = 'scheme';

    private readonly clickToPayService: IClickToPayService | null;

    /**
     * Reference to the 'ClickToPayComponent'
     */
    private clickToPayRef = null;

    constructor(props) {
        super(props);

        if (!props._disableClickToPay) {
            this.clickToPayService = createClickToPayService(this.props.configuration, this.props.clickToPayConfiguration, this.props.environment);
            this.clickToPayService?.initialize();
        }
    }

    protected static defaultProps = {
        onBinLookup: () => {},
        showBrandsUnderCardNumber: true,
        showFormInstruction: true,
        _disableClickToPay: false
    };

    public setStatus(status: UIElementStatus, props?): this {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        }
        if (this.clickToPayRef?.setStatus) {
            this.clickToPayRef.setStatus(status, props);
        }
        return this;
    }

    private setClickToPayRef = ref => {
        this.clickToPayRef = ref;
    };

    formatProps(props: CardElementProps) {
        const isZeroAuth = props.amount?.value === 0;
        const enableStoreDetails = isZeroAuth ? false : props.session?.configuration?.enableStoreDetails || props.enableStoreDetails;

        return {
            ...props,
            // Mismatch between hasHolderName & holderNameRequired which can mean card can never be valid
            holderNameRequired: !props.hasHolderName ? false : props.holderNameRequired,
            // False for *stored* BCMC cards & if merchant explicitly wants to hide the CVC field
            hasCVC: !((props.brand && props.brand === 'bcmc') || props.hideCVC),
            // billingAddressRequired only available for non-stored cards
            billingAddressRequired: props.storedPaymentMethodId ? false : props.billingAddressRequired,
            // ...(props.brands && !props.groupTypes && { groupTypes: props.brands }),
            type: props.type === 'scheme' ? 'card' : props.type,
            countryCode: props.countryCode ? props.countryCode.toLowerCase() : null,
            // Required for transition period (until configuration object becomes the norm)
            // - if merchant has defined value directly in props, use this instead
            configuration: {
                ...props.configuration,
                socialSecurityNumberMode: props.configuration?.socialSecurityNumberMode ?? 'auto'
            },
            brandsConfiguration: props.brandsConfiguration || props.configuration?.brandsConfiguration || {},
            icon: props.icon || props.configuration?.icon,
            // installmentOptions of a session should be used before falling back to the merchant configuration
            installmentOptions: props.session?.configuration?.installmentOptions || props.installmentOptions,
            enableStoreDetails,
            /**
             * Click to Pay configuration
             * - If email is set explicitly in the configuration, then it can override the one used in the session creation
             */
            clickToPayConfiguration: {
                ...props.clickToPayConfiguration,
                disableOtpAutoFocus: props.clickToPayConfiguration?.disableOtpAutoFocus || false,
                shopperEmail: props.clickToPayConfiguration?.shopperEmail || props?._parentInstance?.options?.session?.shopperEmail,
                telephoneNumber: props.clickToPayConfiguration?.telephoneNumber || props?._parentInstance?.options?.session?.telephoneNumber,
                locale: props.clickToPayConfiguration?.locale || props.i18n?.locale?.replace('-', '_')
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): CardElementData {
        /**
         * this.props.brand is never set for the generic card only for a 'dedicated' single-branded card e.g. bcmc
         * this.state.selectedBrandValue will be set when /binLookup detects a single brand &/or when /binLookup detects a dual-branded card and
         *  the shopper makes a brand selection
         */
        const cardBrand = this.state.selectedBrandValue || this.props.brand;
        const includeStorePaymentMethod = this.props.enableStoreDetails && typeof this.state.storePaymentMethod !== 'undefined';

        return {
            paymentMethod: {
                type: CardElement.type,
                ...this.state.data,
                ...(this.props.storedPaymentMethodId && { storedPaymentMethodId: this.props.storedPaymentMethodId }),
                ...(cardBrand && { brand: cardBrand }),
                ...(this.props.fundingSource && { fundingSource: this.props.fundingSource })
            },
            ...(this.state.billingAddress && { billingAddress: this.state.billingAddress }),
            ...(this.state.socialSecurityNumber && { socialSecurityNumber: this.state.socialSecurityNumber }),
            ...(includeStorePaymentMethod && { storePaymentMethod: Boolean(this.state.storePaymentMethod) }),
            ...(hasValidInstallmentsObject(this.state.installments) && { installments: this.state.installments }),
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef?.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(fieldName) {
        if (this.componentRef?.setFocusOn) this.componentRef.setFocusOn(fieldName);
        return this;
    }

    public onBrand = event => {
        this.eventEmitter.emit('brand', { ...event, brand: event.brand === 'card' ? null : event.brand });
        if (this.props.onBrand) this.props.onBrand(event);
    };

    processBinLookupResponse(binLookupResponse: BinLookupResponse, isReset = false) {
        if (this.componentRef?.processBinLookupResponse) this.componentRef.processBinLookupResponse(binLookupResponse, isReset);
        return this;
    }

    handleUnsupportedCard(errObj) {
        if (this.componentRef?.handleUnsupportedCard) this.componentRef.handleUnsupportedCard(errObj);
        return this;
    }

    private handleClickToPaySubmit = (payload: ClickToPayCheckoutPayload) => {
        this.setState({ data: { ...payload }, valid: {}, errors: {}, isValid: true });
        this.submit();
    };

    onBinLookup(obj: CbObjOnBinLookup) {
        // Handler for regular card comp doesn't need this 'raw' data or to know about 'resets'
        if (!obj.isReset) {
            const nuObj = reject('supportedBrandsRaw').from(obj);
            this.props.onBinLookup(nuObj);
        }
    }

    private fieldTypeToSnakeCase(fieldType) {
        let str = camelCaseToSnakeCase(fieldType);
        // SFs need their fieldType mapped to what the endpoint expects
        if (ALL_SECURED_FIELDS.includes(fieldType)) {
            str = str.substring(ENCRYPTED.length + 1); // strip 'encrypted_' off the string
        }
        return str;
    }

    private onFocus = obj => {
        this.submitAnalytics({
            event: 'info',
            data: { component: this.constructor['type'], type: ANALYTICS_FOCUS_STR, target: this.fieldTypeToSnakeCase(obj.fieldType) }
        });

        // Call merchant defined callback
        this.props.onFocus?.(obj);
    };

    private onBlur = obj => {
        this.submitAnalytics({
            event: 'info',
            data: { component: this.constructor['type'], type: ANALYTICS_UNFOCUS_STR, target: this.fieldTypeToSnakeCase(obj.fieldType) }
        });

        // Call merchant defined callback
        this.props.onBlur?.(obj);
    };

    private onErrorAnalytics = obj => {
        this.submitAnalytics({
            event: 'info',
            data: {
                component: this.constructor['type'],
                type: ANALYTICS_VALIDATION_ERROR_STR,
                target: this.fieldTypeToSnakeCase(obj.fieldType),
                validationErrorCode: obj.errorCode,
                validationErrorMessage: obj.errorMessage
            }
        });
    };

    public onBinValue = triggerBinLookUp(this);

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return this.props.icon ?? this.resources.getImage()(this.brand);
    }

    get brands(): { icon: any; name: string }[] {
        const { brands, brandsConfiguration } = this.props;
        if (brands) {
            return brands.map(brand => {
                const brandIcon = brandsConfiguration[brand]?.icon ?? this.props.modules.resources.getImage()(brand);
                return { icon: brandIcon, name: brand };
            });
        }

        return [];
    }

    get brand(): string {
        return this.props.brand || this.props.type;
    }

    get displayName(): string {
        if (this.props.storedPaymentMethodId) {
            return `•••• ${this.props.lastFour}`;
        }

        return this.props.name || CardElement.type;
    }

    get accessibleName(): string {
        // Use display name, unless it's a stored payment method, there inform user
        return (
            (this.props.name || CardElement.type) +
            (this.props.storedPaymentMethodId
                ? ' ' + this.props.i18n.get('creditCard.storedCard.description.ariaLabel').replace('%@', this.props.lastFour)
                : '')
        );
    }

    get browserInfo() {
        return collectBrowserInfo();
    }
    // Override
    protected payButton = (props: PayButtonFunctionProps) => {
        const isZeroAuth = this.props.amount?.value === 0;
        const isStoredCard = this.props.storedPaymentMethodId?.length > 0;
        return (
            <PayButton
                {...props}
                amount={this.props.amount}
                secondaryAmount={this.props.secondaryAmount}
                label={isZeroAuth && !isStoredCard ? this.props.i18n.get('payButton.saveDetails') : ''}
                onClick={this.submit}
            />
        );
    };

    private renderCardInput(isCardPrimaryInput = true): h.JSX.Element {
        return (
            <CardInput
                setComponentRef={this.setComponentRef}
                {...this.props}
                {...this.state}
                onChange={this.setState}
                onSubmit={this.submit}
                payButton={this.payButton}
                onBrand={this.onBrand}
                onBinValue={this.onBinValue}
                brand={this.brand}
                brandsIcons={this.brands}
                isPayButtonPrimaryVariant={isCardPrimaryInput}
                resources={this.resources}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onErrorAnalytics={this.onErrorAnalytics}
            />
        );
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    <ClickToPayWrapper
                        amount={this.props.amount}
                        configuration={this.props.clickToPayConfiguration}
                        clickToPayService={this.clickToPayService}
                        isStandaloneComponent={false}
                        setClickToPayRef={this.setClickToPayRef}
                        onSetStatus={this.setElementStatus}
                        onSubmit={this.handleClickToPaySubmit}
                        onError={this.handleError}
                    >
                        {isCardPrimaryInput => this.renderCardInput(isCardPrimaryInput)}
                    </ClickToPayWrapper>
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default CardElement;
