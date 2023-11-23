import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import ANCVInput from './components/ANCVInput';
import CoreProvider from '../../core/Context/CoreProvider';
import config from './components/ANCVAwait/config';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import PayButton from '../internal/PayButton';
import { ANCVConfiguration } from './types';
import { PaymentResponseData } from '../../types/global-types';

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
     * Called when the /paymentDetails endpoint returns PartiallyAuthorised. The /paymentDetails happens once the /status
     * returns PartiallyAuthorised
     *
     * @param order
     */
    protected handleOrder = ({ order }: PaymentResponseData) => {
        this.updateParent({ order });

        if (this.props.session && this.props.onOrderCreated) {
            return this.props.onOrderCreated(order);
        }
    };

    public createOrder = () => {
        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        this.setStatus('loading');

        return this.onOrderRequest(this.data)
            .then((order: { orderData: string; pspReference: string }) => {
                this.setState({ order: { orderData: order.orderData, pspReference: order.pspReference } });
                this.submit();
            })
            .catch(error => {
                this.setStatus(error?.message || 'error');
                if (this.props.onError) this.handleError(new AdyenCheckoutError('ERROR', error));
            });
    };

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
                            onActionHandled={this.props.onActionHandled}
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
                    onSubmit={this.createOrder}
                    onChange={this.setState}
                    payButton={this.payButton}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default ANCVElement;
