import { h } from 'preact';
import UIElement from '../UIElement';
import ANCVInput from './components/ANCVInput';
import CoreProvider from '../../core/Context/CoreProvider';
import config from './components/MBWayAwait/config';
import Await from '../../components/internal/Await';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { UIElementProps } from '../types';

export interface ANCVProps extends UIElementProps {
    paymentData?: any; //TODO
    data: ANCVDataState;
}

interface ANCVDataState {
    beneficiaryId: string;
}

export class ANCVElement extends UIElement<ANCVProps> {
    private static type = 'ancv';

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
                    onChange={this.setState}
                    payButton={this.payButton}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default ANCVElement;
