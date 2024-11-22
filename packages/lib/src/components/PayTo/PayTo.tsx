import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import PayButton from '../internal/PayButton';

/*
Types (previously in their own file)
 */
import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';
import PayToInput from './components/PayToInput';

export interface PayToConfiguration extends UIElementProps {
    paymentData?: any;
    data: PayToData;
}

export interface PayToData {
    shopperAccountIdentifier: string;
}

/*
Await Config (previously in its own file)
 */
const COUNTDOWN_MINUTES = 15; // min
const THROTTLE_TIME = 60000; // ms
const THROTTLE_INTERVAL = 10000; // ms

const config = {
    COUNTDOWN_MINUTES,
    THROTTLE_TIME,
    THROTTLE_INTERVAL,
    showCountdownTimer: false
};

/**
 *
 */
export class PayToElement extends UIElement<PayToConfiguration> {
    public static type = TxVariants.payto;

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: PayToElement.type,
                shopperAccountIdentifier: this.state.data?.shopperAccountIdentifier
            }
        };
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
                <PayToInput />
            </CoreProvider>
        );
    }
}

export default PayToElement;
