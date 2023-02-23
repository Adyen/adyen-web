import { h } from 'preact';
import UIElement from '../UIElement';
import PaypalComponent from './components/PaypalComponent';
import defaultProps from './defaultProps';
import { PaymentAction } from '../../types';
import { Intent, PayPalElementProps } from './types';
import './Paypal.scss';
import CoreProvider from '../../core/Context/CoreProvider';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
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
        this.handleSubmit = this.handleSubmit.bind(this);
        this.submit = this.submit.bind(this);
    }

    formatProps(props: PayPalElementProps): PayPalElementProps {
        const { merchantId, intent: intentFromConfig } = props.configuration;
        const isZeroAuth = props.amount?.value === 0;

        const intent: Intent = isZeroAuth ? 'tokenize' : props.intent || intentFromConfig;
        const vault = isZeroAuth || props.vault;

        return {
            ...props,
            vault,
            configuration: {
                intent,
                merchantId
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
        if (action.paymentMethodType !== this.type) throw new Error('Invalid Action');

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

    handleCancel() {
        this.handleError(new AdyenCheckoutError('CANCEL'));
    }

    handleComplete(details) {
        const state = { data: { details, paymentData: this.paymentData } };
        this.handleAdditionalDetails(state);
    }

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.resolve(token);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.reject(new Error(errorMessage));
    }

    startPayment() {
        return Promise.reject(new AdyenCheckoutError('ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    }

    handleSubmit() {
        super.submit();

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    submit() {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
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
                    onError={e => {
                        this.handleError(new AdyenCheckoutError('ERROR', e.toString()));
                    }}
                    onSubmit={this.handleSubmit}
                />
            </CoreProvider>
        );
    }
}

export default PaypalElement;
