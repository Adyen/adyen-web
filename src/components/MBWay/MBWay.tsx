import { h } from 'preact';
import UIElement, { UIElementProps } from '../UIElement';
import MBWayInput from './components/MBWayInput';
import CoreProvider from '~/core/Context/CoreProvider';
import config from '~/components/MBWay/components/MBWayAwait/config';
import Await from '~/components/internal/Await';

export class MBWayElement extends UIElement {
    private static type = 'mbway';

    formatProps(props: UIElementProps): UIElementProps {
        return {
            ...props
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
     */
    formatData(): object {
        const paymentMethod: object = {
            type: MBWayElement.type,
            shopperEmail: this.state.data ? this.state.data.email : '',
            telephoneNumber: this.state.data ? this.state.data.phoneNumber : ''
        };

        return {
            paymentMethod
        };
    }

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    get displayName(): string {
        return this.props.name;
    }

    render() {
        if (this.props.paymentData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        loadingContext={this.props.loadingContext}
                        originKey={this.props.originKey}
                        clientKey={this.props.clientKey}
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
                <MBWayInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default MBWayElement;
