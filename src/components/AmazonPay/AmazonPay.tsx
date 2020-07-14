import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import AmazonPayComponent from './components/AmazonPayComponent';
import { AmazonPayElementData, AmazonPayElementProps } from './types';
import defaultProps from './defaultProps';
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
        const { amazonCheckoutSessionId, amazonPayToken } = this.props;
        return {
            paymentMethod: {
                type: AmazonPayElement.type,
                ...(amazonCheckoutSessionId && { amazonCheckoutSessionId }),
                ...(amazonPayToken && { amazonPayToken })
            },
            browserInfo: this.browserInfo
        };
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    render() {
        if (!this.props.showPayButton) return null;

        if (this.props.amazonCheckoutSessionId || this.props.amazonPayToken) {
            return this.payButton({ label: this.props.i18n.get('confirmPurchase') });
        }

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
