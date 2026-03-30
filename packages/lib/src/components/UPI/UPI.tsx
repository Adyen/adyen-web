import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import UPIComponent from './components/UPIComponent';
import { Await } from '../internal/Await';
import { QRLoader } from '../internal/QRLoader';
import { UPIConfiguration, UpiMode, UpiPaymentData, UpiType } from './types';
import { TxVariants } from '../tx-variants';
import isMobile from '../../utils/isMobile';
import { UPI_MODE } from './constants';
import { ICore } from '../../types';
import { PaymentMethodBrand } from '../../types/global-types';

/**
 * For mobile:
 * We should show upi_intent depending on if `apps` are returned in /paymentMethods response.
 *
 * For non-mobile:
 * We should never show the upi_intent (ignore `apps` in /paymentMethods response)
 * Show upi_qr as default
 */

class UPI extends UIElement<UPIConfiguration> {
    public static readonly type = TxVariants.upi;
    public static readonly txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_intent];
    private mode: UpiMode;
    public brands: PaymentMethodBrand[];

    protected static readonly defaultProps = {
        showPaymentMethodItemImages: true
    };

    constructor(checkout: ICore, props: UPIConfiguration) {
        super(checkout, props);
        this.mode = isMobile() ? UPI_MODE.INTENT : UPI_MODE.QR_CODE;
    }

    formatProps(props: UPIConfiguration): UPIConfiguration {
        const { apps = [], showPaymentMethodItemImages } = props;
        const hasIntentApps = apps.length > 0;

        this.brands = showPaymentMethodItemImages
            ? apps.map(app => {
                  const imageName = `upi/${app.id.toLowerCase()}`;
                  const brandIcon = this.core.modules.resources?.getImage()(imageName);
                  return { icon: brandIcon, name: imageName };
              })
            : [];

        if (isMobile() && hasIntentApps) {
            return {
                ...super.formatProps(props),
                apps
            };
        }

        this.mode = UPI_MODE.QR_CODE;
        return {
            ...super.formatProps(props),
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
        if (this.mode === UPI_MODE.QR_CODE) {
            return TxVariants.upi_qr;
        }
        return TxVariants.upi_intent;
    }

    protected override componentToRender(): h.JSX.Element {
        const { type, url, paymentMethodType } = this.props;

        const isAutoPay = !!this.props.mandate;

        let content: h.JSX.Element;

        switch (type) {
            case 'qrCode':
                content = (
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
                break;
            case 'await':
                content = (
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
                break;
            default:
                content = (
                    <UPIComponent
                        setComponentRef={this.setComponentRef}
                        payButton={this.payButton}
                        onChange={this.setState}
                        apps={this.props.apps}
                        mode={this.mode}
                        showPayButton={this.props.showPayButton}
                        mandate={this.props.mandate}
                        brands={this.brands}
                    />
                );
        }

        return <div data-testid="upi-container">{content}</div>;
    }
}

export default UPI;
