import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CustomCardInput from './CustomCardInput';
import collectBrowserInfo from '../../utils/browserInfo';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CardBinLookupData, CardFocusData } from '../internal/SecuredFields/lib/types';
import { BrandObject } from '../Card/types';
import { getCardImageUrl, fieldTypeToSnakeCase } from '../internal/SecuredFields/utils';
import { TxVariants } from '../tx-variants';
import { CustomCardConfiguration } from './types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM } from '../Card/constants';

const SELECTABLE_DUAL_BRANDED_SCENARIO = 'Dual Branded (Selectable): Regulation mandates that you must provide a brand selection mechanism';
const DISPLAY_ONLY_DUAL_BRANDED_SCENARIO = 'Dual Branded (Display-only): No selection mechanism required';

export class CustomCard extends UIElement<CustomCardConfiguration> {
    public static readonly type = TxVariants.customCard;

    protected static readonly defaultProps = {
        onBinLookup: () => {},
        brandsConfiguration: {}
    };

    private brand = TxVariants.card;

    formatProps(props: CustomCardConfiguration) {
        return {
            ...props,
            type: TxVariants.customCard
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const sfBrand = this.state.selectedBrandValue;
        return {
            paymentMethod: {
                type: 'scheme',
                ...this.state.data,
                ...(sfBrand && { brand: sfBrand })
            },
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef?.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(frame) {
        if (this.componentRef?.setFocusOn) this.componentRef.setFocusOn(frame);
        return this;
    }

    processBinLookupResponse(binLookupResponse) {
        if (this.componentRef?.processBinLookupResponse) this.componentRef.processBinLookupResponse(binLookupResponse);
        return this;
    }

    dualBrandingChangeHandler(e: Event | string) {
        if (this.componentRef?.dualBrandingChangeHandler) this.componentRef.dualBrandingChangeHandler(e);
        return this;
    }

    handleUnsupportedCard(errObj) {
        if (this.componentRef?.handleUnsupportedCard) this.componentRef.handleUnsupportedCard(errObj);
        return this;
    }

    onBinLookup(obj: CardBinLookupData) {
        const nuObj = { ...obj };
        nuObj.rootNode = this._node;

        if (!nuObj.isReset) {
            // Add brandImage urls, first checking if the merchant has configured their own one for the brand
            nuObj.supportedBrandsRaw = obj.supportedBrandsRaw?.map((item: BrandObject) => {
                item.brandImageUrl = this.props.brandsConfiguration[item.brand]?.icon ?? getCardImageUrl(item.brand, this.resources);
                return item;
            });

            // Check for dual branded scenario and, if so, discern which type
            let isDualBrandedScenario = false;
            let isSelectableDualBrandedScenario = false;

            if (obj.supportedBrandsRaw?.length > 1) {
                isDualBrandedScenario = true;
                isSelectableDualBrandedScenario = obj.detectedBrands.some(item =>
                    (DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM as readonly string[]).includes(item)
                );
            }

            // Set the dual branding type
            nuObj.dualBrandingType = null;

            if (isDualBrandedScenario) {
                nuObj.dualBrandingType = isSelectableDualBrandedScenario ? SELECTABLE_DUAL_BRANDED_SCENARIO : DISPLAY_ONLY_DUAL_BRANDED_SCENARIO;
            }
        }

        this.props.onBinLookup(nuObj);
    }

    public onBinValue = triggerBinLookUp(this);

    get isValid() {
        return !!this.state.isValid;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    private onFocus = (obj: CardFocusData) => {
        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: obj.focus === true ? InfoEventType.focus : InfoEventType.unfocus,
            target: fieldTypeToSnakeCase(obj.fieldType) as UiTarget
        });

        this.submitAnalytics(event);

        // Call merchant defined callback
        this.props.onFocus?.(obj);
    };

    protected onEnterKeyPressed = (activeElement: Element, component: UIElement) => {
        this.props.onEnterKeyPressed?.(activeElement, component);
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <CustomCardInput
                ref={ref => {
                    this.componentRef = ref;
                }}
                {...this.props}
                {...this.state}
                handleKeyPress={this.handleKeyPress}
                rootNode={this._node}
                onChange={this.setState}
                onBinValue={this.onBinValue}
                implementationType={'custom'}
                resources={this.resources}
                brand={this.brand}
                onFocus={this.onFocus}
                onSubmitAnalytics={this.submitAnalytics}
            />
        );
    }
}

export default CustomCard;
