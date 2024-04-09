import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import AmazonPayComponent from './components/AmazonPayComponent';
import { AmazonPayElementData, AmazonPayConfiguration, CheckoutDetailsRequest } from './types';
import defaultProps from './defaultProps';
import { getCheckoutDetails } from './services';
import './AmazonPay.scss';
import { TxVariants } from '../tx-variants';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import { SendAnalyticsObject } from '../../core/Analytics/types';

export class AmazonPayElement extends UIElement<AmazonPayConfiguration> {
    public static type = TxVariants.amazonpay;

    protected static defaultProps = defaultProps;

    formatProps(props) {
        return {
            ...props,
            checkoutMode: props.isDropin ? 'ProcessOrder' : props.checkoutMode,
            environment: props.environment.toUpperCase(),
            locale: props.locale.replace('-', '_'),
            productType: props.isDropin && !props.addressDetails ? 'PayOnly' : props.productType
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): AmazonPayElementData {
        const { amazonCheckoutSessionId: checkoutSessionId } = this.props;
        return {
            paymentMethod: {
                type: AmazonPayElement.type,
                ...(checkoutSessionId && { checkoutSessionId })
            },
            browserInfo: this.browserInfo
        };
    }

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        // Analytics will need to know about this.props.isExpress & this.props.expressPage
        super.submitAnalytics({ ...analyticsObj }, this.props);
    }

    getShopperDetails() {
        const { amazonCheckoutSessionId, configuration = {}, loadingContext, clientKey } = this.props;
        if (!amazonCheckoutSessionId) return console.error('Could not shopper details. Missing checkoutSessionId.');

        const request: CheckoutDetailsRequest = {
            checkoutSessionId: amazonCheckoutSessionId,
            getDeliveryAddress: true,
            publicKeyId: configuration.publicKeyId,
            region: configuration.region
        };

        return getCheckoutDetails(loadingContext, clientKey, request);
    }

    public handleDeclineFlow() {
        const { amazonCheckoutSessionId, configuration = {}, loadingContext, clientKey } = this.props;
        if (!amazonCheckoutSessionId) return console.error('Could handle the decline flow. Missing checkoutSessionId.');

        const request: CheckoutDetailsRequest = {
            checkoutSessionId: amazonCheckoutSessionId,
            getDeclineFlowUrl: true,
            publicKeyId: configuration.publicKeyId,
            region: configuration.region
        };

        getCheckoutDetails(loadingContext, clientKey, request)
            .then((response = {}) => {
                if (!response?.declineFlowUrl) throw response;
                window.location.assign(response.declineFlowUrl);
            })
            .catch(error => {
                if (this.props.onError) this.props.onError(error, this.componentRef);
            });
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    public submit(): void {
        const amazonComponentSubmit = this.componentRef && this.componentRef.getSubmitFunction();
        if (amazonComponentSubmit) {
            return amazonComponentSubmit();
        }
        this.makePaymentsCall().then(sanitizeResponse).then(verifyPaymentDidNotFail).then(this.handleResponse).catch(this.handleFailedResult);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <AmazonPayComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    showPayButton={this.props.showPayButton}
                    onClick={this.props.onClick}
                    onError={this.props.onError}
                    onSignOut={this.props.onSignOut}
                    {...this.props}
                />
            </CoreProvider>
        );
    }
}

export default AmazonPayElement;
