import { h } from 'preact';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import QRLoader from '../internal/QRLoader';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';

export interface QRLoaderContainerProps extends UIElementProps {
    /**
     * Number of miliseconds that the component will wait in between status calls
     */
    delay?: number;

    /**
     * Number of minutes that the component should keep on loading
     */
    countdownTime?: number;

    type?: string;
    brandLogo?: string;
    buttonLabel?: string;
    qrCodeImage?: string;
    paymentData?: string;
    introduction: string;
    redirectIntroduction?: string;
    timeToPay?: string;
    instructions?: string | (() => h.JSX.Element);
    copyBtn?: boolean;
}

class QRLoaderContainer<T extends QRLoaderContainerProps = QRLoaderContainerProps> extends UIElement<T> {
    // Using the generic here allow to fully extend the QRLoaderContainer (including it's props)
    protected static defaultProps = {
        qrCodeImage: '',
        amount: null,
        paymentData: null,
        onError: () => {},
        onComplete: () => {},
        onActionHandled: () => {}
    };

    formatData() {
        return {
            paymentMethod: {
                type: this.props.type || this.constructor['type'],
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
