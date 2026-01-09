import { h, RefObject } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import UPIComponent from './components/UPIComponent';
import { Await } from '../internal/Await';
import { QRLoader } from '../internal/QRLoader';
import { UPIConfiguration, UpiMode, UpiPaymentData, UpiType } from './types';
import { TxVariants } from '../tx-variants';
import isMobile from '../../utils/isMobile';
import type { ICore } from '../../core/types';
import { getIntentOption, getQrOption, getVpaOption } from './constants';

/**
 * For mobile:
 * We should show upi_collect and upi_intent depending on if `apps` are returned in /paymentMethods response.
 * If there is no apps, hide segmented controls.
 * The upi_collect should always be on the second tab.
 * Never show QR code.
 *
 * For non-mobile:
 * We should never show the upi_intent (ignore `apps` in /paymentMethods response)
 * The upi_qr should be on the first tab and the upi_collect should be on second tab
 */

class UPI extends UIElement<UPIConfiguration> {
    public static type = TxVariants.upi;
    public static txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_collect, TxVariants.upi_intent];

    private selectedMode: UpiMode;

    constructor(checkout: ICore, props: UPIConfiguration) {
        super(checkout, props);
        this.selectedMode = this.props.defaultMode;
    }

    formatProps(props: UPIConfiguration): UPIConfiguration {
        if (!isMobile()) {
            return {
                ...super.formatProps(props),
                defaultMode: ['qrCode', 'vpa'].includes(props?.defaultMode) ? props.defaultMode : 'qrCode',
                apps: [], // For desktop, ignore the apps
                segmentedControlOptions: [getQrOption(props.i18n), getVpaOption(props.i18n)]
            };
        }

        const { i18n, apps = [] } = props;
        const hasIntentApps = apps.length > 0;
        if (hasIntentApps) {
            // Mobile with UPI apps
            const allowedModes: UpiMode[] = ['intent', 'vpa'];
            const defaultMode = allowedModes.includes(props.defaultMode) ? props.defaultMode : 'intent';
            return {
                ...super.formatProps(props),
                defaultMode,
                apps,
                segmentedControlOptions: [getIntentOption(i18n), getVpaOption(i18n)]
            };
        }

        // Mobile, but no UPI apps
        return {
            ...super.formatProps(props),
            defaultMode: 'vpa', // Only VPA is possible
            apps: [],
            segmentedControlOptions: []
        };
    }

    public get isValid(): boolean {
        return this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        const { virtualPaymentAddress, app } = this.state.data || {};

        return {
            paymentMethod: {
                type: this.paymentType,
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
        return TxVariants.upi_intent;
    }

    private onUpdateMode = (mode: UpiMode): void => {
        this.selectedMode = mode;
    };

    protected override componentToRender(): h.JSX.Element {
        const { type, url, paymentMethodType } = this.props;

        const isAutoPay = !!this.props.mandate;

        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        {...this.props}
                        qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                        type={TxVariants.upi_qr}
                        brandLogo={this.props.brandLogo || this.icon}
                        onComplete={this.onComplete}
                        introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
                        countdownTime={this.props.countdownTime ?? 5}
                        onActionHandled={this.onActionHandled}
                        showAmount={!isAutoPay}
                    />
                );
            case 'await':
                return (
                    <Await
                        url={url}
                        type={paymentMethodType}
                        showCountdownTimer
                        shouldRedirectAutomatically
                        showAmount={!isAutoPay}
                        countdownTime={this.props.countdownTime ?? 5}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onActionHandled={this.onActionHandled}
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
                        segmentedControlOptions={this.props.segmentedControlOptions}
                        defaultMode={this.props.defaultMode}
                        showPayButton={this.props.showPayButton}
                        mandate={this.props.mandate}
                    />
                );
        }
    }
}

export default UPI;
