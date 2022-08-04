import { h } from 'preact';
import { UIElement } from '../UIElement';
import CardInput from './components/CardInput';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';
import collectBrowserInfo from '../../utils/browserInfo';
import { BinLookupResponse, CardElementData, CardElementProps } from './types';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CbObjOnBinLookup } from '../internal/SecuredFields/lib/types';
import { reject } from '../internal/SecuredFields/utils';
import { hasValidInstallmentsObject } from './components/CardInput/utils';
import ClickToPayProvider from './components/ClickToPay/context/ClickToPayProvider';
import { createClickToPayService } from './components/ClickToPay/utils';
import { ClickToPayCheckoutPayload, IClickToPayService } from './components/ClickToPay/services/types';
import ClickToPayWrapper from './ClickToPayWrapper';
import { UIElementStatus } from '../types';

export class CardElement extends UIElement<CardElementProps> {
    public static type = 'scheme';

    private readonly clickToPayService: IClickToPayService | null;

    /**
     * Reference to the 'ClickToPayComponent'
     */
    private clickToPayRef = null;

    constructor(props) {
        super(props);
        this.clickToPayService = createClickToPayService(this.props.configuration, this.props.clickToPayConfiguration, this.props.environment);
        this.clickToPayService?.initialize();
    }

    protected static defaultProps = {
        onBinLookup: () => {},
        showBrandsUnderCardNumber: true,
        SRConfig: {}
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

    public setComponentRef = ref => {
        this.componentRef = ref;
    };

    private setClickToPayRef = ref => {
        this.clickToPayRef = ref;
    };

    formatProps(props: CardElementProps) {
        // Extract &/or set defaults for the screenreader error panel
        const { collateErrors = true, moveFocus = false, showPanel = false } = props.SRConfig;

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
            SRConfig: {
                collateErrors,
                moveFocus,
                showPanel
            },
            clickToPayConfiguration: {
                ...props.clickToPayConfiguration,
                shopperIdentityValue: props.clickToPayConfiguration?.shopperIdentityValue || props?._parentInstance?.options?.session?.shopperEmail,
                locale: props.clickToPayConfiguration?.locale || props.i18n.locale.replace('-', '_')
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

    public onBinValue = triggerBinLookUp(this);

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return this.props.icon ?? getImage({ loadingContext: this.props.loadingContext })(this.brand);
    }

    get brands(): { icon: any; name: string }[] {
        const { brands, loadingContext, brandsConfiguration } = this.props;
        if (brands) {
            return brands.map(brand => {
                const brandIcon = brandsConfiguration[brand]?.icon ?? getImage({ loadingContext })(brand);
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
            />
        );
    }

    render() {
        return (
            <CoreProvider
                i18n={this.props.i18n}
                loadingContext={this.props.loadingContext}
                commonProps={{ isCollatingErrors: this.props.SRConfig.collateErrors }}
            >
                <ClickToPayProvider
                    amount={this.props.amount}
                    clickToPayService={this.clickToPayService}
                    setClickToPayRef={this.setClickToPayRef}
                    onSetStatus={this.setElementStatus}
                    onSubmit={this.handleClickToPaySubmit}
                    onError={this.handleError}
                >
                    <ClickToPayWrapper>{isCardPrimaryInput => this.renderCardInput(isCardPrimaryInput)}</ClickToPayWrapper>
                </ClickToPayProvider>
            </CoreProvider>
        );
    }
}

export default CardElement;
