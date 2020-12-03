import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import AmazonPayComponent from './components/AmazonPayComponent';
import { AmazonPayElementData, AmazonPayElementProps } from './types';
import defaultProps from './defaultProps';
import { getCheckoutDetails } from './services';
import './AmazonPay.scss';

export class AmazonPayElement extends UIElement<AmazonPayElementProps> {
    public static type = 'amazonpay';
    protected static defaultProps = defaultProps;

    formatProps(props) {
        return {
            ...props,
            environment: props.environment.toUpperCase(),
            locale: props.locale.replace('-', '_'),
            region: props.region.toUpperCase()
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

    getShopperDetails() {
        const { amazonCheckoutSessionId: checkoutSessionId, loadingContext, clientKey } = this.props;
        if (!checkoutSessionId) return console.error('Could not shopper details. Missing checkoutSessionId');

        const request = {
            checkoutSessionId,
            getDeliveryAddress: true
        };

        return getCheckoutDetails(loadingContext, clientKey, request);
    }

    handleDeclineFlow() {
        const { amazonCheckoutSessionId: checkoutSessionId, loadingContext, clientKey, returnUrl } = this.props;
        if (!checkoutSessionId) return console.error('Missing checkoutSessionId or returnUrl.');

        const request = {
            checkoutSessionId,
            returnUrl,
            getDeclineFlowUrl: true
        };

        getCheckoutDetails(loadingContext, clientKey, request)
            .then((response = {}) => {
                if (!response?.declineFlowUrl) throw response;
                window.location.assign(response.declineFlowUrl);
            })
            .catch(error => {
                if (this.props.onError) this.props.onError(error);
            });
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <AmazonPayComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                />
            </CoreProvider>
        );
    }
}

export default AmazonPayElement;
