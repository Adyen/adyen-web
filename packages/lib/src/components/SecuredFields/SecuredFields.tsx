import { h } from 'preact';
import UIElement from '../UIElement';
import SecuredFields from './SecuredFieldsInput';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import triggerBinLookUp from '../internal/SecuredFields/binLookup/triggerBinLookUp';
import { CbObjOnBinLookup } from '../internal/SecuredFields/lib/types';
import { BrandObject } from '../Card/types';
import { getCardImageUrl } from '../internal/SecuredFields/utils';
import { TxVariants } from '../tx-variants';
import { ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../ThreeDS2';
import { UIElementProps } from '../types';

interface SecuredFieldProps extends UIElementProps {
    styles: any;
    brand: string[];
    // TODO..
    [key: string]: any;
}

export class SecuredFieldsElement extends UIElement<SecuredFieldProps> {
    public static type = TxVariants.securedfields;
    public static txVariants = [TxVariants.securedfields, TxVariants.card];
    public static dependencies = [ThreeDS2DeviceFingerprint, ThreeDS2Challenge];

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
                type: 'scheme',
                ...this.state.data,
                ...(sfBrand && { brand: sfBrand })
            },
            browserInfo: this.browserInfo
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

    get icon() {
        return this.resources.getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

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
                />
            </CoreProvider>
        );
    }
}

export default SecuredFieldsElement;
