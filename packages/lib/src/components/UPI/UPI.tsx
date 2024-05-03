import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import UPIComponent from './components/UPIComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { TX_VARIANT, UPIElementProps, UpiMode, UpiPaymentData } from './types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import isMobile from '../../utils/isMobile';
/**
 * For mobile:
 * We should show upi_collect or upi_intent depending on if `apps` are returned in /paymentMethods response
 * The upi_qr should always be on the second tab
 *
 * For non-mobile:
 * We should never show the upi_intent (ignore `apps` in /paymentMethods response)
 * The upi_qr should be on the first tab and the upi_collect should be on second tab
 */

class UPI extends UIElement<UPIElementProps> {
    public static type = 'upi';

    private selectedMode: UpiMode;

    constructor(props: UPIElementProps) {
        super(props);
        this.selectedMode = this.props.defaultMode;
    }

    formatProps(props: UPIElementProps) {
        if (!isMobile()) {
            return {
                ...super.formatProps(props),
                defaultMode: props?.defaultMode ?? UpiMode.QrCode,
                // For large screen, ignore the apps
                apps: []
            };
        }

        const hasIntentApps = props.apps?.length > 0;
        const fallbackDefaultMode = hasIntentApps ? UpiMode.Intent : UpiMode.Vpa;
        const allowedModes = [fallbackDefaultMode, UpiMode.QrCode];
        const upiCollectApp = {
            id: UpiMode.Vpa,
            name: props.i18n.get('upi.collect.dropdown.label'),
            type: TX_VARIANT.UpiCollect
        };
        const apps = hasIntentApps ? [...props.apps.map(app => ({ ...app, type: TX_VARIANT.UpiIntent })), upiCollectApp] : [];
        return {
            ...super.formatProps(props),
            defaultMode: allowedModes.includes(props?.defaultMode) ? props.defaultMode : fallbackDefaultMode,
            apps
        };
    }

    public get isValid(): boolean {
        return this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        if (this.selectedMode === UpiMode.QrCode) {
            return {
                paymentMethod: {
                    type: TX_VARIANT.UpiQr
                }
            };
        }

        const { virtualPaymentAddress, app } = this.state.data;
        const type = this.selectedMode === UpiMode.Vpa ? TX_VARIANT.UpiCollect : app?.type;
        return {
            paymentMethod: {
                ...(type && { type }),
                ...(type === TX_VARIANT.UpiCollect && virtualPaymentAddress && { virtualPaymentAddress }),
                ...(type === TX_VARIANT.UpiIntent && app?.id && { appId: app.id })
            }
        };
    }

    private onUpdateMode = (mode: UpiMode): void => {
        this.selectedMode = mode;
        if (mode === UpiMode.QrCode) {
            /**
             * When selecting QR code mode, we need to clear the state data and trigger the 'onChange'.
             */
            this.setState({ data: {}, valid: {}, errors: {}, isValid: true });
        }
    };

    private renderContent(type: string): h.JSX.Element {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                        type={TX_VARIANT.UpiQr}
                        brandLogo={this.props.brandLogo || this.icon}
                        onComplete={this.onComplete}
                        introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
                    />
                );
            case 'await':
                return (
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        onError={this.props.onError}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={TX_VARIANT.UpiCollect}
                        messageText={this.props.i18n.get('upi.vpaWaitingMessage')}
                        awaitText={this.props.i18n.get('await.waitForConfirmation')}
                        showCountdownTimer
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
                    />
                );
            default:
                return (
                    <UPIComponent
                        ref={(ref: RefObject<typeof UPIComponent>) => {
                            this.componentRef = ref;
                        }}
                        payButton={this.payButton}
                        onChange={this.setState}
                        onUpdateMode={this.onUpdateMode}
                        apps={this.props.apps}
                        defaultMode={this.props.defaultMode}
                        showPayButton={this.props.showPayButton}
                    />
                );
        }
    }

    public render(): h.JSX.Element {
        const { type } = this.props;
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>{this.renderContent(type)}</SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default UPI;
