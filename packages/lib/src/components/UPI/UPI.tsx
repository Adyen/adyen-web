import { h, RefObject } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import UPIComponent from './components/UPIComponent';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { UPIConfiguration, UpiMode, UpiPaymentData, UpiType } from './types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
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

class UPI extends UIElement<UPIConfiguration> {
    public static type = TxVariants.upi;
    public static txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_collect];

    private selectedMode: UpiMode;

    constructor(props: UPIConfiguration) {
        super(props);
        this.selectedMode = this.props.defaultMode;
    }

    formatProps(props: UPIConfiguration) {
        if (!isMobile()) {
            return {
                ...super.formatProps(props),
                defaultMode: props?.defaultMode ?? 'qrCode',
                // For large screen, ignore the apps
                apps: []
            };
        }

        const hasIntentApps = props.apps?.length > 0;
        const fallbackDefaultMode = hasIntentApps ? 'intent' : 'vpa';
        const allowedModes = [fallbackDefaultMode, 'qrCode'];
        const upiCollectApp = {
            id: 'vpa',
            name: props.i18n.get('upi.collect.dropdown.label'),
            type: TxVariants.upi_collect
        };
        const apps = hasIntentApps ? [...props.apps.map(app => ({ ...app, type: TxVariants.UpiIntent })), upiCollectApp] : [];
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
        const { virtualPaymentAddress, app } = this.state.data || {};

        return {
            paymentMethod: {
                ...(this.paymentType && { type: this.paymentType }),
                ...(this.paymentType === TxVariants.upi_collect && virtualPaymentAddress && { virtualPaymentAddress }),
                ...(this.paymentType === TxVariants.upi_intent && app?.id && { appId: app.id })
            }
        };
    }

    get paymentType(): UpiType {
        if (this.selectedMode === 'qrCode') {
            return TxVariants.upi_qr;
        }
        if (this.selectedMode === 'vpa') {
            return TxVariants.upi_collect;
        }
        return this.state.data?.app?.type;
    }

    private onUpdateMode = (mode: UpiMode): void => {
        this.selectedMode = mode;
    };

    private renderContent(type: string, url: string, paymentMethodType: string): h.JSX.Element {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                        type={TxVariants.upi_qr}
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
                        url={url}
                        type={paymentMethodType}
                        showCountdownTimer
                        shouldRedirectAutomatically
                        countdownTime={5}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onActionHandled={this.props.onActionHandled}
                        onError={this.props.onError}
                        messageText={this.props.i18n.get('upi.vpaWaitingMessage')}
                        awaitText={this.props.i18n.get('await.waitForConfirmation')}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
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
        const { type, url, paymentMethodType } = this.props;
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>{this.renderContent(type, url, paymentMethodType)}</SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default UPI;
