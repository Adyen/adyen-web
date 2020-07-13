import { h } from 'preact';
import { UIElement } from '../UIElement';
import CardInput from './components/CardInput';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';
import collectBrowserInfo from '../../utils/browserInfo';
import fetchJSONData from '../../utils/fetch-json-data';
import { CardElementData, CardElementProps } from './types';

export class CardElement extends UIElement<CardElementProps> {
    public static type = 'scheme';
    private currentRequestId;

    formatProps(props: CardElementProps) {
        return {
            ...props,
            // Mismatch between hasHolderName & holderNameRequired which can mean card can never be valid
            holderNameRequired: !props.hasHolderName ? false : props.holderNameRequired,
            // Special catch for recurring bcmc (i.e. card with no cvc field). Scenario?? - Dropin - One click with no details
            hasCVC: !((props.brand && props.brand === 'bcmc') || props.hideCVC),
            // billingAddressRequired only available for non-stored cards
            billingAddressRequired: props.storedPaymentMethodId ? false : props.billingAddressRequired,
            ...(props.brands && !props.groupTypes && { groupTypes: props.brands }),
            type: props.type === 'scheme' ? 'card' : props.type
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): CardElementData {
        const cardBrand = this.state.additionalSelectValue || this.props.brand;
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
            ...(includeStorePaymentMethod && { storePaymentMethod: Boolean(this.state.storePaymentMethod) }),
            ...(this.state.installments && this.state.installments.value && { installments: this.state.installments }),
            browserInfo: this.browserInfo
        };
    }

    updateStyles(stylesObj) {
        if (this.componentRef && this.componentRef.updateStyles) this.componentRef.updateStyles(stylesObj);
        return this;
    }

    setFocusOn(fieldName) {
        if (this.componentRef && this.componentRef.setFocusOn) this.componentRef.setFocusOn(fieldName);
        return this;
    }

    public onBrand = event => {
        this.eventEmitter.emit('brand', { ...event, brand: event.brand === 'card' ? null : event.brand });
        if (this.props.onBrand) this.props.onBrand(event);
    };

    processBinLookupResponse(binLookupObject) {
        if (this.componentRef && this.componentRef.processBinLookupResponse) this.componentRef.processBinLookupResponse(binLookupObject);
        return this;
    }

    public onBinValue = callbackObj => {
        // Allow way for merchant to disallow binLookup by specifically setting the prop to false
        if (this.props.doBinLookup === false) {
            if (this.props.onBinValue) this.props.onBinValue(callbackObj);
            return;
        }

        // Do binLookup when encryptedBin property is present (and only if the merchant is using a clientKey)
        if (callbackObj.encryptedBin && this.props.clientKey) {
            // Store id of request we're about to make
            this.currentRequestId = callbackObj.uuid;

            fetchJSONData(
                {
                    path: `v1/bin/binLookup?token=${this.props.clientKey}`,
                    loadingContext: this.props.loadingContext,
                    method: 'POST',
                    contentType: 'application/json'
                },
                {
                    supportedBrands: this.props.brands,
                    encryptedBin: callbackObj.encryptedBin,
                    requestId: callbackObj.uuid // Pass id of request
                }
            ).then(data => {
                // If response is the one we were waiting for...
                if (data && data.requestId === this.currentRequestId) {
                    // ...call processBinLookupResponse with the response object
                    // if it contains at least one brand (a failed lookup will just contain requestId)
                    if (data.supportedBrands && data.supportedBrands.length) {
                        this.processBinLookupResponse(data);
                    }
                }
            });
        } else if (this.currentRequestId) {
            // If onBinValue callback is called AND we have been doing binLookup BUT passed object doesn't have an encryptedBin property
            // - then the number of digits in number field has dropped below threshold for BIN lookup - so reset the UI
            this.processBinLookupResponse(null);

            this.currentRequestId = null; // Ignore any pending responses
        }

        if (this.props.onBinValue) this.props.onBinValue(callbackObj);
    };

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.brand);
    }

    get brands(): { icon: any; name: string }[] {
        if (this.props.brands) {
            return this.props.brands.map(brand => ({
                icon: getImage({ loadingContext: this.props.loadingContext })(brand),
                name: brand
            }));
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

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <CardInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                    onBrand={this.onBrand}
                    onBinValue={this.onBinValue}
                    brand={this.brand}
                />
            </CoreProvider>
        );
    }
}

export default CardElement;
