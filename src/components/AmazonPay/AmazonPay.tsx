import { h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import withPayButton from '~/components/helpers/withPayButton';
import AmazonPayComponent from '~/components/AmazonPay/components/AmazonPayComponent';
import { AmazonElementProps } from './types';
import './AmazonPay.scss';


export class AmazonPayElement extends UIElement {
    public static type = 'amazonpay';
    protected static defaultProps = defaultProps as AmazonElementProps;

    constructor(props) {
        super(props);
    }

    formatProps(props) {
        return {
            ...props,
            showButton: !!props.showPayButton
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
     */
    formatData() {
        const { amazonPayToken } = this.props;
        return {
            paymentMethod: {
                type: AmazonPayElement.type,
                ...(amazonPayToken && { amazonPayToken })
            }
        };
    }

    /**
     * @returns {Boolean} AmazonPay does not require any validation
     */
    get isValid() {
        return true;
    }
    
    render() {
        if (!this.props.showButton) return null;

        if (this.props.amazonPayToken) {
            return (
                this.payButton({ label: this.props.i18n.get('confirmPurchase') })
            );
        }

        return (
            <AmazonPayComponent
                ref={ref => {
                    this.componentRef = ref;
                }}
                {...this.props}
            />
        );
    }
}

export default withPayButton(AmazonPayElement);
