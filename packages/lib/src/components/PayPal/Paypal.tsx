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
import { createShopperDetails } from './utils/create-shopper-details';
import { TxVariants } from '../tx-variants';

class PaypalElement extends UIElement<PayPalElementProps> {
    public static type = TxVariants.paypal;
    public static subtype = 'sdk';
    private paymentData = null;
    private resolve = null;
    private reject = null;

    protected static defaultProps = defaultProps;

    constructor(props: PayPalElementProps) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    formatProps(props: PayPalElementProps): PayPalElementProps {
        const { merchantId, intent: intentFromConfig } = props.configuration;
        const isZeroAuth = props.amount?.value === 0;

        const intent: Intent = isZeroAuth ? 'tokenize' : props.intent || intentFromConfig;
        const vault = intent === 'tokenize' || props.vault;

        return {
            ...props,
            vault,
            configuration: {
                intent,
                merchantId
            }
        };
    }

    public submit = () => {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    };

    /**
     * Formats the component data output
     */
    protected formatData() {
        const { isExpress } = this.props;

        return {
            paymentMethod: {
                type: PaypalElement.type,
                subtype: isExpress ? 'express' : PaypalElement.subtype
            }
        };
    }

    public handleAction = (action: PaymentAction) => {
        return this.updateWithAction(action);
    };

    public updateWithAction = (action: PaymentAction) => {
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
    };

    /**
     * Dropin Validation
     *
     * @remarks
     * Paypal does not require any specific Dropin validation
     */
    get isValid() {
        return true;
    }

    private handleCancel = () => {
        this.handleError(new AdyenCheckoutError('CANCEL'));
    };

    private handleOnApprove = (data: any, actions: any): Promise<void> | void => {
        const { onShopperDetails } = this.props;
        const state = { data: { details: data, paymentData: this.paymentData } };

        if (!onShopperDetails) {
            this.handleAdditionalDetails(state);
            return;
        }

        return actions.order
            .get()
            .then(paypalOrder => {
                const shopperDetails = createShopperDetails(paypalOrder);
                return new Promise<void>((resolve, reject) => onShopperDetails(shopperDetails, paypalOrder, { resolve, reject }));
            })
            .then(() => this.handleAdditionalDetails(state))
            .catch(error => this.handleError(new AdyenCheckoutError('ERROR', 'Something went wrong while parsing PayPal Order', { cause: error })));
    };

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.resolve(token);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.reject(new Error(errorMessage));
    }

    private handleSubmit(): Promise<void> {
        super.submit();

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    render() {
        if (!this.props.showPayButton) return null;

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PaypalComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onCancel={this.handleCancel}
                    onChange={this.setState}
                    onApprove={this.handleOnApprove}
                    onError={error => {
                        this.handleError(new AdyenCheckoutError('ERROR', error.toString(), { cause: error }));
                    }}
                    onSubmit={this.handleSubmit}
                />
            </CoreProvider>
        );
    }
}

export default PaypalElement;
