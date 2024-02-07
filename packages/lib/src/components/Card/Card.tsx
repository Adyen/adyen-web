import { h } from 'preact';
import CardInput from './components/CardInput';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import { BinLookupResponse, CardElementData, CardConfiguration } from './types';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CbObjOnBinLookup, CbObjOnConfigSuccess, CbObjOnFocus } from '../internal/SecuredFields/lib/types';
import { fieldTypeToSnakeCase, reject } from '../internal/SecuredFields/utils';
import { hasValidInstallmentsObject } from './components/CardInput/utils';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import ClickToPayWrapper from './components/ClickToPayWrapper';
import { ComponentFocusObject } from '../../types/global-types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
import { UIElementStatus } from '../internal/UIElement/types';
import UIElement from '../internal/UIElement';
import PayButton from '../internal/PayButton';
import { PayButtonProps } from '../internal/PayButton/PayButton';
import type { ICore } from '../../core/types';
import {
    ANALYTICS_FOCUS_STR,
    ANALYTICS_CONFIGURED_STR,
    ANALYTICS_UNFOCUS_STR,
    ANALYTICS_VALIDATION_ERROR_STR,
    ANALYTICS_RENDERED_STR
} from '../../core/Analytics/constants';
import { ALL_SECURED_FIELDS } from '../internal/SecuredFields/lib/configuration/constants';
import { FieldErrorAnalyticsObject, SendAnalyticsObject } from '../../core/Analytics/types';
import { hasOwnProperty } from '../../utils/hasOwnProperty';

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
            this.clickToPayService = createClickToPayService(this.props.configuration, this.props.clickToPayConfiguration, this.props.environment);
            this.clickToPayService?.initialize();
        }
    }

    protected static defaultProps = {
        onBinLookup: () => {},
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

    formatProps(props: CardConfiguration) {
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
            }
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

    onBinLookup(obj: CbObjOnBinLookup) {
        // Handler for regular card comp doesn't need this 'raw' data or to know about 'resets'
        if (!obj.isReset) {
            const nuObj = reject('supportedBrandsRaw').from(obj);
            this.props.onBinLookup(nuObj);
        }
    }

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        const { type } = analyticsObj;

        if (type === ANALYTICS_RENDERED_STR || type === ANALYTICS_CONFIGURED_STR) {
            // Check if it's a storedCard
            if (this.constructor['type'] === 'scheme') {
                if (hasOwnProperty(this.props, 'supportedShopperInteractions')) {
                    analyticsObj.isStoredPaymentMethod = true;
                    analyticsObj.brand = this.props.brand;
                }
            }
        }

        super.submitAnalytics(analyticsObj);
    }

    private onConfigSuccess = (obj: CbObjOnConfigSuccess) => {
        this.submitAnalytics({
            type: ANALYTICS_CONFIGURED_STR
        });

        this.props.onConfigSuccess?.(obj);
    };

    private onFocus = (obj: ComponentFocusObject) => {
        this.submitAnalytics({
            type: ANALYTICS_FOCUS_STR,
            target: fieldTypeToSnakeCase(obj.fieldType)
        });

        // Call merchant defined callback
        if (ALL_SECURED_FIELDS.includes(obj.fieldType)) {
            this.props.onFocus?.(obj.event as CbObjOnFocus);
        } else {
            this.props.onFocus?.(obj);
        }
    };

    private onBlur = (obj: ComponentFocusObject) => {
        this.submitAnalytics({
            type: ANALYTICS_UNFOCUS_STR,
            target: fieldTypeToSnakeCase(obj.fieldType)
        });

        // Call merchant defined callback
        if (ALL_SECURED_FIELDS.includes(obj.fieldType)) {
            this.props.onBlur?.(obj.event as CbObjOnFocus);
        } else {
            this.props.onBlur?.(obj);
        }
    };

    private onErrorAnalytics = (obj: FieldErrorAnalyticsObject) => {
        this.submitAnalytics({
            type: ANALYTICS_VALIDATION_ERROR_STR,
            target: fieldTypeToSnakeCase(obj.fieldType),
            validationErrorCode: obj.errorCode,
            validationErrorMessage: obj.errorMessage
        });
    };

    public onBinValue = triggerBinLookUp(this);

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
    // Override
    protected payButton = (props: PayButtonProps) => {
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
                brand={this.props.brand}
                brandsIcons={this.brands}
                isPayButtonPrimaryVariant={isCardPrimaryInput}
                resources={this.resources}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onErrorAnalytics={this.onErrorAnalytics}
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
