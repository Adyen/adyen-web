import { h, RefObject } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import UPIComponent from './components/UPIComponent';
import { Await } from '../internal/Await';
import { QRLoader } from '../internal/QRLoader';
import { UPIConfiguration, UpiPaymentData, UpiType } from './types';
import { TxVariants } from '../tx-variants';
import isMobile from '../../utils/isMobile';
import { UPI_MODE } from './constants';
import { ICore } from '../../types';

/**
 * For mobile:
 * We should show upi_intent depending on if `apps` are returned in /paymentMethods response.
 *
 * For non-mobile:
 * We should never show the upi_intent (ignore `apps` in /paymentMethods response)
 * Show upi_qr as default
 */

class UPI extends UIElement<UPIConfiguration> {
    public static type = TxVariants.upi;
    public static readonly txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_intent];
    constructor(checkout: ICore, props: UPIConfiguration) {
        super(checkout, props);
        if (props.defaultMode) {
            // NOSONAR
            console.warn('[Adyen Checkout] UPI configuration property "defaultMode" is deprecated and will be removed in a future version.');
        }
    }

    formatProps(props: UPIConfiguration): UPIConfiguration {
        const { apps = [] } = props;
        const hasIntentApps = apps.length > 0;
        if (isMobile() && hasIntentApps) {
            // Mobile with UPI apps
            return {
                ...super.formatProps(props),
                defaultMode: UPI_MODE.INTENT,
                apps
            };
        }

        return {
            ...super.formatProps(props),
            defaultMode: UPI_MODE.QR_CODE,
            apps: []
        };
    }

    public get isValid(): boolean {
        return this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        const { app } = this.state.data || {};

        return {
            paymentMethod: {
                type: this.paymentType,
                ...(this.paymentType === TxVariants.upi_intent && app?.id && { appId: app.id })
            }
        };
    }

    get paymentType(): UpiType {
        if (this.props.defaultMode === UPI_MODE.QR_CODE) {
            // NOSONAR
            return TxVariants.upi_qr;
        }
        return TxVariants.upi_intent;
    }

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
                        amount={this.props.amount}
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
                        apps={this.props.apps}
                        defaultMode={this.props.defaultMode /* NOSONAR */}
                        showPayButton={this.props.showPayButton}
                        amount={this.props.amount}
                        mandate={this.props.mandate}
                    />
                );
        }
    }
}

export default UPI;
