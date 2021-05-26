import { h } from 'preact';
import UIElement from '../UIElement';
import PaypalComponent from './components/PaypalComponent';
import defaultProps from './defaultProps';
import { PaymentAction } from '../../types';
import { PayPalElementProps } from './types';
import './Paypal.scss';
import CoreProvider from '../../core/Context/CoreProvider';
import { ERRORS } from './constants';

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
        this.submit = this.submit.bind(this);
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
            this.handleResolve(action.sdkData.token);
        } else {
            this.handleReject(ERRORS.NO_TOKEN_PROVIDED);
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

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(ERRORS.WRONG_INSTANCE);
        this.resolve(token);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(ERRORS.WRONG_INSTANCE);
        this.reject(new Error(errorMessage));
    }

    startPayment() {
        return Promise.reject(ERRORS.SUBMIT_NOT_SUPPORTED);
    }

    handleSubmit() {
        const { data, isValid } = this;
        if (this.props.onSubmit) this.props.onSubmit({ data, isValid }, this.elementRef);

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    submit() {
        this.startPayment().catch(e => {
            this.props.onError(e, this.elementRef);
        });
    }

    render() {
        if (!this.props.showPayButton) return null;

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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
            </CoreProvider>
        );
    }
}

export default PaypalElement;
