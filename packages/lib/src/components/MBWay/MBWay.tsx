import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import MBWayInput from './components/MBWayInput';
import { CoreProvider } from '../../core/Context/CoreProvider';
import config from './components/MBWayAwait/config';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
import { AwaitConfiguration } from '../internal/Await/types';

export class MBWayElement extends UIElement<AwaitConfiguration> {
    public static type = TxVariants.mbway;

    formatProps(props) {
        const { data = {}, placeholders = {} } = props;

        return {
            ...props,
            data: {
                phoneNumber: data.telephoneNumber || data.phoneNumber,
                phonePrefix: data.phonePrefix || '+351' // if not specified default to Portuguese country code
            },
            placeholders: {
                phoneNumber: placeholders.telephoneNumber || placeholders.phoneNumber
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
                ...(this.state.data?.phoneNumber && { telephoneNumber: this.state.data.phonePrefix + this.state.data.phoneNumber })
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
                            type={config.type}
                            messageText={this.props.i18n.get(config.messageTextId)}
                            awaitText={this.props.i18n.get(config.awaitTextId)}
                            showCountdownTimer={config.showCountdownTimer}
                            delay={config.STATUS_INTERVAL}
                            countdownTime={config.COUNTDOWN_MINUTES}
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
                <MBWayInput
                    /* @ts-ignore ref handled internally by Component */
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    setComponentRef={this.setComponentRef}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default MBWayElement;
