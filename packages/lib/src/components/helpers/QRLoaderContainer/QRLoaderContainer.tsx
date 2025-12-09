import { h } from 'preact';
import UIElement from '../../internal/UIElement/UIElement';
import { QRLoader } from '../../internal/QRLoader';
import RedirectButton from '../../internal/RedirectButton';
import { QRLoaderConfiguration } from './types';

class QRLoaderContainer<T extends QRLoaderConfiguration = QRLoaderConfiguration> extends UIElement<T> {
    // Using the generic here allow to fully extend the QRLoaderContainer (including it's props)
    protected static defaultProps = {
        qrCodeImage: '',
        amount: null,
        paymentData: null,
        onError: () => {}
    };

    formatData() {
        return {
            paymentMethod: {
                type: this.type,
                ...this.state.data
            }
        };
    }

    get isValid() {
        return true;
    }

    // Makes possible to extend the final QR code step
    public renderQRCode() {
        return (
            <QRLoader
                {...this.props}
                delay={this.props.delay}
                countdownTime={this.props.countdownTime}
                instructions={this.props.instructions}
                type={this.constructor['type']}
                brandLogo={this.props.brandLogo || this.icon}
                onComplete={this.onComplete}
                onActionHandled={this.onActionHandled}
                brandName={this.displayName}
                onSubmitAnalytics={this.submitAnalytics}
            />
        );
    }

    protected override componentToRender(): h.JSX.Element {
        if (this.props.paymentData) {
            return this.renderQRCode();
        }

        if (this.props.showPayButton) {
            return (
                <RedirectButton
                    showPayButton={this.props.showPayButton}
                    name={this.displayName}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                />
            );
        }

        return null;
    }
}

export default QRLoaderContainer;
