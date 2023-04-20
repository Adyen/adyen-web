import { h } from 'preact';
import UIElement from '../UIElement';
import BlikInput from '../../components/Blik/components/BlikInput';
import Await from '../internal/Await';
import CoreProvider from '../../core/Context/CoreProvider';
import config from './config';
import RedirectButton from '../../components/internal/RedirectButton';

interface BlikElementData {
    paymentMethod: {
        type: string;
        blikCode: string;
    };
}

class BlikElement extends UIElement {
    public static type = 'blik';

    formatData(): BlikElementData {
        const recurringPayment = !!this.props.storedPaymentMethodId;

        return {
            paymentMethod: {
                type: BlikElement.type,
                ...(!recurringPayment && { blikCode: this.state?.data?.blikCode }),
                ...(recurringPayment && { storedPaymentMethodId: this.props.storedPaymentMethodId })
            }
        };
    }

    get isValid(): boolean {
        if (this.props.storedPaymentMethodId) {
            return true;
        }

        return !!this.state.isValid;
    }

    /**
     * NOTE: for future reference:
     *  this.props.onComplete (which is called from this.onComplete) equates to the merchant defined onAdditionalDetails callback
     *  (the initial /payments response defines an "await" action, actionTypes.ts translates this to "onComplete: props.onAdditionalDetails")
     */
    render() {
        if (this.props.paymentData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onError={this.handleError}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={config.type}
                        messageText={this.props.i18n.get(config.messageTextId)}
                        awaitText={this.props.i18n.get(config.awaitTextId)}
                        showCountdownTimer={config.showCountdownTimer}
                        delay={config.STATUS_INTERVAL}
                        countdownTime={config.COUNTDOWN_MINUTES}
                        throttleTime={config.THROTTLE_TIME}
                        throttleInterval={config.THROTTLE_INTERVAL}
                        onActionHandled={this.props.onActionHandled}
                    />
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.storedPaymentMethodId ? (
                    <RedirectButton
                        name={this.displayName}
                        amount={this.props.amount}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                ) : (
                    <BlikInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default BlikElement;
