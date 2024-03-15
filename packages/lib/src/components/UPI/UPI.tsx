import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import UPIComponent from './components/UPIComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { TX_VARIANT, UPIElementProps, UpiMode, UpiPaymentData } from './types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import isMobile from '../../utils/isMobile';
import RedirectShopper from '../Redirect/components/RedirectShopper';

/**
 * 'upi' tx variant is the parent one.
 * 'upi_collect' and 'upi_qr' are the sub variants which are submitted according to the shopper interaction.
 *
 * Small screens:
 * upi_collect + upi_intent on the first tab (if appIds are returned in paymentMethods response
 * QR always on the second tab
 *
 * Large screens:
 * Never upi_intent (ignore appIds in /paymentMethods response)
 * QR on the first tab and upi_collect on second tab
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
                defaultMode: UpiMode.QrCode,
                // For large screen, ignore the appIds
                appIds: []
            };
        }

        const hasIntentApps = props.appIds?.length > 0;
        const defaultMode = hasIntentApps ? UpiMode.Intent : UpiMode.Collect;
        const upiCollectApp = {
            id: UpiMode.Collect,
            name: props.i18n.get('upi.collect.enterUpiId'),
            type: TX_VARIANT.UpiCollect
        };
        const appIds = hasIntentApps ? [...props.appIds.map(appId => ({ ...appId, type: TX_VARIANT.UpiIntent })), upiCollectApp] : [];

        return {
            ...super.formatProps(props),
            defaultMode,
            appIds
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

        const { virtualPaymentAddress, appId } = this.state.data;
        const type = this.selectedMode === UpiMode.Collect ? TX_VARIANT.UpiCollect : appId?.type;
        return {
            paymentMethod: {
                ...(type && { type }),
                ...(type === TX_VARIANT.UpiCollect && virtualPaymentAddress && { virtualPaymentAddress }),
                ...(type === TX_VARIANT.UpiIntent && appId && { appId: appId.id })
            }
        };
    }

    private onUpdateMode = (mode: UpiMode): void => {
        // todo: switching tabs does not preserve vpa
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
            case 'redirect':
                // todo: fix it
                return <RedirectShopper url={''} method={'GET'} data={{}} />;
            default:
                return (
                    <UPIComponent
                        ref={(ref: RefObject<typeof UPIComponent>) => {
                            this.componentRef = ref;
                        }}
                        payButton={this.payButton}
                        onChange={this.setState}
                        onUpdateMode={this.onUpdateMode}
                        appIds={this.props.appIds}
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
