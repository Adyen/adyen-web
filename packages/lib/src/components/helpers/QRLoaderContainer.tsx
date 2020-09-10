import { h } from 'preact';
import UIElement, { UIElementProps } from '../UIElement';
import QRLoader from '../internal/QRLoader';
import CoreProvider from '../../core/Context/CoreProvider';

interface QRLoaderContainerProps extends UIElementProps {
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
    shouldRedirectOnMobile?: boolean;
    qrCodeImage?: string;
    paymentData?: string;
    instructions?: string;
}

class QRLoaderContainer extends UIElement<QRLoaderContainerProps> {
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
                type: this.props.type || this.constructor['type'],
                ...this.state.data
            }
        };
    }

    get isValid() {
        return true;
    }

    render() {
        if (this.props.paymentData) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        shouldRedirectOnMobile={this.props.shouldRedirectOnMobile}
                        type={this.constructor['type']}
                        brandLogo={this.props.brandLogo || this.icon}
                        delay={this.props.delay}
                        onComplete={this.onComplete}
                        countdownTime={this.props.countdownTime}
                        instructions={this.props.instructions}
                    />
                </CoreProvider>
            );
        }

        if (this.props.showPayButton) {
            return this.payButton({
                label: this.props.buttonLabel ? this.props.i18n.get(this.props.buttonLabel) : this.props.i18n.get('continue'),
                classNameModifiers: ['standalone']
            });
        }

        return null;
    }
}

export default QRLoaderContainer;
