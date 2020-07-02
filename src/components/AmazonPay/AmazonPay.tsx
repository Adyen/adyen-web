import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '~/core/Context/CoreProvider';
import defaultProps from './defaultProps';
import AmazonPayComponent from './components/AmazonPayComponent';
import { AmazonPayElementProps } from './types';
import './AmazonPay.scss';

export class AmazonPayElement extends UIElement<AmazonPayElementProps> {
    public static type = 'amazonpay';
    protected static defaultProps = defaultProps;

    constructor(props) {
        super(props);
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { checkoutSessionId } = this.props;
        return {
            paymentMethod: {
                type: AmazonPayElement.type,
                ...(checkoutSessionId && { checkoutSessionId })
            }
        };
    }

    get isValid() {
        return true;
    }

    render() {
        if (!this.props.showPayButton) return null;

        if (this.props.checkoutSessionId) {
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
