import { h } from 'preact';
import UIElement from '../UIElement';
import PaypalComponent from './components/PaypalComponent';
import defaultProps from './defaultProps';
import { PaymentAction } from '../../types';
import { PayPalElementProps } from './types';
import './Paypal.scss';

class PaypalElement extends UIElement<PayPalElementProps> {
    public static type = 'paypal';
    public static subtype = 'sdk';
    protected static defaultProps = defaultProps;
    private paymentData = null;
    private resolve = null;
    private reject = null;

    constructor(props: PayPalElementProps) {
        super(props);

        this.handleAction = this.handleAction.bind(this);
        this.updateWithAction = this.updateWithAction.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleComplete = this.handleComplete.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Required for transition period (until configuration object becomes the norm)
    // - if merchant has defined properties directly in props, use these instead
    protected formatProps(props) {
        const { configuration, intent, merchantId } = props;
        return {
            ...props,
            configuration: {
                ...configuration,
                ...(intent && { intent }),
                ...(merchantId && { merchantId })
            }
        };
    }

    /**
     * Formats the component data output
     */
    protected formatData() {
        return {
            paymentMethod: {
                type: PaypalElement.type,
                subtype: PaypalElement.subtype
            }
        };
    }

    handleAction(action: PaymentAction) {
        return this.updateWithAction(action);
    }

    updateWithAction(action: PaymentAction) {
        if (action.paymentMethodType !== this.data.paymentMethod.type) throw new Error('Invalid Action');

        if (action.paymentData) {
            this.paymentData = action.paymentData;
        }

        if (action.sdkData && action.sdkData.token) {
            this.resolve(action.sdkData.token);
        } else {
            this.reject(new Error('No token was provided'));
        }

        return null;
    }

    /**
     * Dropin Validation
     *
     * @remarks
     * Paypal does not require any specific Dropin validation
     */
    get isValid() {
        return true;
    }

    handleCancel(data) {
        this.props.onCancel(data, this.elementRef);
    }

    handleComplete(details) {
        const state = { data: { details, paymentData: this.paymentData } };
        this.props.onAdditionalDetails(state, this.elementRef);
    }

    handleError(data) {
        this.props.onError(data, this.elementRef);
    }

    handleSubmit() {
        this.submit();

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    render() {
        if (!this.props.showPayButton) return null;

        return (
            <PaypalComponent
                ref={ref => {
                    this.componentRef = ref;
                }}
                {...this.props}
                onCancel={this.handleCancel}
                onChange={this.setState}
                onComplete={this.handleComplete}
                onError={this.handleError}
                onSubmit={this.handleSubmit}
            />
        );
    }
}

export default PaypalElement;
