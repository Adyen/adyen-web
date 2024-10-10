import { h } from 'preact';
import UIElement from '../../internal/UIElement/UIElement';
import QRLoader from '../../internal/QRLoader';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import RedirectButton from '../../internal/RedirectButton';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { QRLoaderConfiguration } from './types';

class QRLoaderContainer<T extends QRLoaderConfiguration = QRLoaderConfiguration> extends UIElement<T> {
    // Using the generic here allow to fully extend the QRLoaderContainer (including it's props)
    protected static defaultProps = {
        qrCodeImage: '',
        amount: null,
        paymentData: null,
        onError: () => {},
        onComplete: () => {}
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        type={this.constructor['type']}
                        brandLogo={this.props.brandLogo || this.icon}
                        delay={this.props.delay}
                        onComplete={this.onComplete}
                        countdownTime={this.props.countdownTime}
                        instructions={this.props.instructions}
                        onActionHandled={this.props.onActionHandled}
                        brandName={this.displayName}
                        onSubmitAnalytics={this.submitAnalytics}
                    />
                </SRPanelProvider>
            </CoreProvider>
        );
    }

    render() {
        if (this.props.paymentData) {
            return this.renderQRCode();
        }

        if (this.props.showPayButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <RedirectButton
                        showPayButton={this.props.showPayButton}
                        name={this.displayName}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                </CoreProvider>
            );
        }

        return null;
    }
}

export default QRLoaderContainer;
