import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CustomCardInput from './CustomCardInput';
import { CoreProvider } from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CardBinLookupData, CardFocusData } from '../internal/SecuredFields/lib/types';
import { BrandObject } from '../Card/types';
import { getCardImageUrl, fieldTypeToSnakeCase } from '../internal/SecuredFields/utils';
import { TxVariants } from '../tx-variants';
import { CustomCardConfiguration } from './types';
import { ANALYTICS_FOCUS_STR, ANALYTICS_UNFOCUS_STR } from '../../core/Analytics/constants';
import { AnalyticsEventInfo } from '../../core/Analytics/AnalyticsEventInfo';

export class CustomCard extends UIElement<CustomCardConfiguration> {
    public static type = TxVariants.customCard;

    public static analyticsType = 'custom-scheme';

    protected static defaultProps = {
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
        const event = new AnalyticsEventInfo({
            type: obj.focus === true ? ANALYTICS_FOCUS_STR : ANALYTICS_UNFOCUS_STR,
            target: fieldTypeToSnakeCase(obj.fieldType)
        });

        this.submitAnalytics(event);

        // Call merchant defined callback
        this.props.onFocus?.(obj);
    };

    protected onEnterKeyPressed = (activeElement: Element, component: UIElement) => {
        this.props.onEnterKeyPressed?.(activeElement, component);
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
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
                />
            </CoreProvider>
        );
    }
}

export default CustomCard;
