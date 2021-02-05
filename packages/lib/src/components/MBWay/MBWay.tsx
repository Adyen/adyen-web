import { h } from 'preact';
import UIElement from '../UIElement';
import MBWayInput from './components/MBWayInput';
import CoreProvider from '../../core/Context/CoreProvider';
import config from './components/MBWayAwait/config';
import Await from '../../components/internal/Await';

export class MBWayElement extends UIElement {
    private static type = 'mbway';

    formatProps(props) {
        const { data = {}, placeholders = {} } = props;

        return {
            ...props,
            data: {
                telephoneNumber: data.telephoneNumber || data.phoneNumber || ''
            },
            placeholders: {
                telephoneNumber: placeholders.telephoneNumber || placeholders.phoneNumber || '+351 932 123 456'
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): object {
        return {
            paymentMethod: {
                type: MBWayElement.type,
                ...(this.state.data?.telephoneNumber && { telephoneNumber: this.state.data.telephoneNumber })
            }
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
