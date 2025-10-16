import { h } from 'preact';
import CardInput from './components/CardInput';
import { CoreProvider } from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import { BinLookupResponse, CardElementData, CardConfiguration } from './types';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CardBinLookupData, CardConfigSuccessData, CardFocusData } from '../internal/SecuredFields/lib/types';
import { fieldTypeToSnakeCase } from '../internal/SecuredFields/utils';
import { reject } from '../../utils/commonUtils';
import { hasValidInstallmentsObject } from './components/CardInput/utils';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import ClickToPayWrapper from './components/ClickToPayWrapper';
import { ComponentFocusObject } from '../../types/global-types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
import type { PayButtonFunctionProps, UIElementStatus } from '../internal/UIElement/types';
import UIElement from '../internal/UIElement';
import PayButton from '../internal/PayButton';
import type { ICore } from '../../core/types';
import { ANALYTICS_FOCUS_STR, ANALYTICS_CONFIGURED_STR, ANALYTICS_UNFOCUS_STR, ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';
import { ALL_SECURED_FIELDS } from '../internal/SecuredFields/lib/constants';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import AdyenCheckoutError, { IMPLEMENTATION_ERROR } from '../../core/Errors/AdyenCheckoutError';
import CardInputDefaultProps from './components/CardInput/defaultProps';
import { getCardConfigData } from './components/CardInput/utils';
import { AnalyticsEvent } from '../../core/Analytics/AnalyticsEvent';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';

export class CardElement extends UIElement<CardConfiguration> {
    public static type = TxVariants.scheme;

    private readonly clickToPayService: IClickToPayService | null;

    /**
     * Reference to the 'ClickToPayComponent'
     */
    private clickToPayRef = null;

    constructor(checkout: ICore, props?: CardConfiguration) {
        super(checkout, props);

        if (props && !props._disableClickToPay) {
            this.clickToPayService = createClickToPayService(
                this.props.configuration,
                this.props.clickToPayConfiguration,
                this.props.environment,
                this.analytics
            );

            void this.clickToPayService?.initialize();
        }
    }

    protected static defaultProps = {
        showFormInstruction: true,
        _disableClickToPay: false,
        doBinLookup: true,
        // Merge most of CardInput's defaultProps
        ...reject(['type', 'setComponentRef']).from(CardInputDefaultProps)
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

    formatProps(props: CardConfiguration): CardConfiguration {
        // The value from a session should be used, before falling back to the merchant configuration
        const enableStoreDetails = props.session?.configuration?.enableStoreDetails ?? props.enableStoreDetails;

        const isZeroAuth = props.amount?.value === 0;
        const showStoreDetailsCheckbox = isZeroAuth ? false : enableStoreDetails;

        const storedCardID = props.storedPaymentMethodId || props.id; // check if we've been passed a (checkout) processed storedCard or one that merchant has pulled from the PMs response
        const isEcommerceStoredCard = storedCardID && props?.supportedShopperInteractions?.includes('Ecommerce'); // If we have a storedCard does it support Ecommerce (it might not if the merchant has pulled it from the PMs response)

        // If we have a storedPM but it doesn't support Ecommerce - we can't make a storedCard component from it
        if (storedCardID && !isEcommerceStoredCard) {
            // TODO - Decide if an error is too severe? Would a console.warning suffice?
            throw new AdyenCheckoutError(
                IMPLEMENTATION_ERROR,
                'You are trying to create a storedCard from a stored PM that does not support Ecommerce interactions'
            );
        }

        return {
            ...props,
            // Mismatch between hasHolderName & holderNameRequired which can mean card can never be valid
            holderNameRequired: !props.hasHolderName ? false : props.holderNameRequired,
            // False for *stored* BCMC cards & if merchant explicitly wants to hide the CVC field
            hasCVC: !((props.brand && props.brand === 'bcmc') || props.hideCVC),
            // billingAddressRequired only available for non-stored cards
            billingAddressRequired: props.storedPaymentMethodId ? false : props.billingAddressRequired,
            // edge case where merchant has defined both an onAddressLookup callback AND set billingAddressMode: 'partial' - which leads to some strange behaviour in the address UI
            billingAddressMode: props.onAddressLookup ? CardInputDefaultProps.billingAddressMode : props.billingAddressMode,
            /** props.brand will be specified in the case of a StoredCard or a Bancontact component, for a regular Card we default it to 'card' */
            brand: props.brand ?? TxVariants.card,
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
            showStoreDetailsCheckbox,
            /**
             * Click to Pay configuration
             * - If email is set explicitly in the configuration, then it can override the one used in the session creation
             */
            clickToPayConfiguration: {
                ...props.clickToPayConfiguration,
                disableOtpAutoFocus: props.clickToPayConfiguration?.disableOtpAutoFocus || false,
                shopperEmail: props.clickToPayConfiguration?.shopperEmail || this.core.options?.session?.shopperEmail,
                telephoneNumber: props.clickToPayConfiguration?.telephoneNumber || this.core.options?.session?.telephoneNumber,
                locale: props.clickToPayConfiguration?.locale || props.i18n?.locale?.replace('-', '_')
            },
            ...(storedCardID && { storedPaymentMethodId: storedCardID })
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): CardElementData {
        /**
         *  this.state.selectedBrandValue will be set when:
         *  - /binLookup detects a single brand,
         *  - when /binLookup detects a dual-branded card and the shopper makes a brand selection
         *  - or, in the case of a storedCard
         */
        const cardBrand = this.state.selectedBrandValue;

        return {
            paymentMethod: {
                type: CardElement.type,
                ...this.state.data,
                ...(this.props.storedPaymentMethodId && {
                    storedPaymentMethodId: this.props.storedPaymentMethodId,
                    holderName: this.props.holderName ?? ''
                }),
                ...(cardBrand && { brand: cardBrand }),
                ...(this.props.fundingSource && { fundingSource: this.props.fundingSource }),
                ...(this.state.fastlaneData && { fastlaneData: btoa(JSON.stringify(this.state.fastlaneData)) })
            },
            ...(this.state.billingAddress && { billingAddress: this.state.billingAddress }),
            ...(this.state.socialSecurityNumber && { socialSecurityNumber: this.state.socialSecurityNumber }),
            ...this.storePaymentMethodPayload,
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
        this.props.onBrand?.(event);
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

    onBinLookup(obj: CardBinLookupData) {
        // Handler for regular card comp doesn't need this 'raw' data or to know about 'resets'
        if (!obj.isReset) {
            const nuObj = reject('supportedBrandsRaw').from(obj);
            this.props.onBinLookup?.(nuObj);
        }
    }

    protected submitAnalytics(analyticsObj: AnalyticsEvent) {
        const isInfoType = analyticsObj instanceof AnalyticsInfoEvent;

        if ((isInfoType && analyticsObj.type === ANALYTICS_RENDERED_STR) || (isInfoType && analyticsObj.type === ANALYTICS_CONFIGURED_STR)) {
            // Check if it's a storedCard
            if (this.constructor['type'] === 'scheme') {
                if (hasOwnProperty(this.props, 'supportedShopperInteractions')) {
                    analyticsObj.isStoredPaymentMethod = true;
                    analyticsObj.brand = this.props.brand;
                }
            }

            // Add config data
            if (isInfoType && analyticsObj.type === ANALYTICS_RENDERED_STR) {
                analyticsObj.configData = getCardConfigData(this.props);
            }
        }

        super.submitAnalytics(analyticsObj);
    }

    private onConfigSuccess = (obj: CardConfigSuccessData) => {
        const event = new AnalyticsInfoEvent({ type: ANALYTICS_CONFIGURED_STR });
        this.submitAnalytics(event);

        this.props.onConfigSuccess?.(obj);
    };

    private onFocus = (obj: ComponentFocusObject) => {
        const event = new AnalyticsInfoEvent({ type: ANALYTICS_FOCUS_STR, target: fieldTypeToSnakeCase(obj.fieldType) });
        this.submitAnalytics(event);

        // Call merchant defined callback
        if (ALL_SECURED_FIELDS.includes(obj.fieldType)) {
            this.props.onFocus?.(obj.event as CardFocusData);
        } else {
            this.props.onFocus?.(obj);
        }
    };

    private onBlur = (obj: ComponentFocusObject) => {
        const event = new AnalyticsInfoEvent({ type: ANALYTICS_UNFOCUS_STR, target: fieldTypeToSnakeCase(obj.fieldType) });
        this.submitAnalytics(event);

        // Call merchant defined callback
        if (ALL_SECURED_FIELDS.includes(obj.fieldType)) {
            this.props.onBlur?.(obj.event as CardFocusData);
        } else {
            this.props.onBlur?.(obj);
        }
    };

    public onBinValue = triggerBinLookUp(this);

    get storePaymentMethodPayload() {
        const isStoredCard = this.props.storedPaymentMethodId?.length > 0;
        if (isStoredCard) {
            return {};
        }

        /**
         * For regular card, zero auth payments, we store the payment method, *if* the configuration says we should:
         *  - For sessions, this means if the session has been created with storePaymentMethodMode: 'askForConsent'
         *  - For the advanced flow, this means if the merchant has still set enableStoreDetails: true
         *
         * What we are doing is.. if for a normal payment we would show the "Save for my next payment" checkbox,
         * for a zero-auth payment we effectively click the checkbox on behalf of the shopper.
         */
        const isZeroAuth = this.props.amount?.value === 0;
        if (isZeroAuth) {
            return this.props.enableStoreDetails ? { storePaymentMethod: true } : {};
        }

        // For regular card, non-zero auth payments, we store the payment method based on the checkbox value.
        const includeStorePaymentMethod = this.props.showStoreDetailsCheckbox && typeof this.state.storePaymentMethod !== 'undefined';
        return includeStorePaymentMethod ? { storePaymentMethod: Boolean(this.state.storePaymentMethod) } : {};
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return this.props.icon ?? this.resources.getImage()(this.props.brand);
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

    protected override payButton = (props: PayButtonFunctionProps) => {
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
                onSubmitAnalytics={this.submitAnalytics}
                onChange={this.setState}
                onSubmit={this.submit}
                handleKeyPress={this.handleKeyPress}
                payButton={this.payButton}
                onBrand={this.onBrand}
                onBinValue={this.onBinValue}
                brand={this.props.brand}
                brandsIcons={this.brands}
                isPayButtonPrimaryVariant={isCardPrimaryInput}
                resources={this.resources}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onConfigSuccess={this.onConfigSuccess}
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
