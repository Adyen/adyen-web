import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import ANCVInput from './components/ANCVInput';
import { CoreProvider } from '../../core/Context/CoreProvider';
import config from './components/ANCVAwait/config';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import PayButton from '../internal/PayButton';
import { ANCVConfiguration } from './types';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';

export class ANCVElement extends UIElement<ANCVConfiguration> {
    public static type = 'ancv';

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: ANCVElement.type,
                beneficiaryId: this.state.data?.beneficiaryId
            }
        };
    }

    private onOrderRequest = data => {
        if (this.props.onOrderRequest)
            return new Promise((resolve, reject) => {
                this.props.onOrderRequest(resolve, reject, data);
            });

        if (this.props.session) {
            return this.props.session.createOrder();
        }
    };

    /**
     * Check if order exists, if it does Resolve.
     * Otherwise createOrder and then Resolve.
     */
    public createOrder = (): Promise<void> => {
        this.setStatus('loading');

        // allow for multiple ANCV payments, follow giftcard logic and just use order if it exists
        if (this.props.order) {
            return Promise.resolve();
        }

        return this.onOrderRequest(this.data)
            .then((order: { orderData: string; pspReference: string }) => {
                const stateOrder = { order: { orderData: order.orderData, pspReference: order.pspReference } };
                this.setState(stateOrder);
                return Promise.resolve();
            })
            .catch(error => {
                this.setStatus(error?.message || 'error');
                if (this.props.onError) {
                    if (error instanceof AdyenCheckoutError) {
                        this.handleError(error);
                    } else {
                        this.handleError(new AdyenCheckoutError('ERROR', error));
                    }
                }
            });
    };

    public submit() {
        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        this.createOrder()
            .then(this.makePaymentsCall)
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch(this.handleFailedResult);
    }

    // Reimplement payButton similar to GiftCard to allow to set onClick
    public payButton = props => {
        return <PayButton {...props} />;
    };

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    get displayName(): string {
        return this.props.name;
    }

    render() {
        if (this.props.paymentData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <SRPanelProvider srPanel={this.props.modules.srPanel}>
                        <Await
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                            clientKey={this.props.clientKey}
                            paymentData={this.props.paymentData}
                            onError={this.props.onError}
                            onComplete={this.onComplete}
                            brandLogo={this.icon}
                            type={this.constructor['type']}
                            messageText={this.props.i18n.get('ancv.confirmPayment')}
                            awaitText={this.props.i18n.get('await.waitForConfirmation')}
                            showCountdownTimer={config.showCountdownTimer}
                            throttleTime={config.THROTTLE_TIME}
                            throttleInterval={config.THROTTLE_INTERVAL}
                            onActionHandled={this.onActionHandled}
                        />
                    </SRPanelProvider>
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <ANCVInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onSubmit={this.submit}
                    onChange={this.setState}
                    payButton={this.payButton}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default ANCVElement;
