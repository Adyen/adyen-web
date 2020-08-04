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
                ...(!recurringPayment && { blikCode: this.state.data.blikCode }),
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

    render() {
        if (this.props.paymentData) {
            const accessKey = this.props.originKey || this.props.clientKey;
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        accessKey={accessKey}
                        paymentData={this.props.paymentData}
                        onError={this.props.onError}
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
                    />
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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
