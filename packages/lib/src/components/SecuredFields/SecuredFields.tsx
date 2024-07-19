import { h } from 'preact';
import UIElement from '../UIElement';
import SecuredFields from './SecuredFieldsInput';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CbObjOnBinLookup, CbObjOnFocus } from '../internal/SecuredFields/lib/types';
import { BrandObject } from '../Card/types';
import { fieldTypeToSnakeCase, getCardImageUrl } from '../internal/SecuredFields/utils';
import { ANALYTICS_FOCUS_STR, ANALYTICS_UNFOCUS_STR } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';

export class SecuredFieldsElement extends UIElement {
    public static type = 'scheme';
    public static analyticsType = 'custom-scheme';

    protected static defaultProps = {
        onBinLookup: () => {},
        brandsConfiguration: {}
    };

    formatProps(props) {
        return {
            ...props,
            type: props.type === 'scheme' || props.type === 'securedfields' ? 'card' : props.type
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const sfBrand = this.state.selectedBrandValue || this.props.brand;
        return {
            paymentMethod: {
                type: SecuredFieldsElement.type,
                ...this.state.data,
                ...(sfBrand && { brand: sfBrand })
            },
            browserInfo: this.browserInfo
        };
    }

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        super.submitAnalytics(analyticsObj, this.props);
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

    onBinLookup(obj: CbObjOnBinLookup) {
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

    private onFocus = (obj: CbObjOnFocus) => {
        this.submitAnalytics({
            type: obj.focus === true ? ANALYTICS_FOCUS_STR : ANALYTICS_UNFOCUS_STR,
            target: fieldTypeToSnakeCase(obj.fieldType)
        });

        // Call merchant defined callback
        this.props.onFocus?.(obj);
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SecuredFields
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    rootNode={this._node}
                    onChange={this.setState}
                    onBinValue={this.onBinValue}
                    implementationType={'custom'}
                    resources={this.resources}
                    onFocus={this.onFocus}
                />
            </CoreProvider>
        );
    }
}

export default SecuredFieldsElement;
