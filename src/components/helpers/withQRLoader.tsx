import { h } from 'preact';
import UIElement from '../UIElement';
import QRLoader from '../internal/QRLoader';
import CoreProvider from '../../core/Context/CoreProvider';

const QRCODE_URL = 'barcode.shtml?barcodeType=qrCode&fileType=png&data=';

interface WithQRLoaderProps {
    type: string;
    brandLogo?: string;
    buttonLabel?: string;
    STATUS_INTERVAL: number;
    COUNTDOWN_MINUTES: number;
    shouldRedirectOnMobile?: boolean;
}

/**
 * QRLoaderContainer: A higher order function which returns a different class based on issuerType
 * @extends UIElement
 */
const withQRLoader = ({
    type,
    brandLogo = null,
    buttonLabel = null,
    STATUS_INTERVAL,
    COUNTDOWN_MINUTES,
    shouldRedirectOnMobile = false
}: WithQRLoaderProps): any => {
    class QRLoaderContainer extends UIElement {
        public static type = type;

        protected static defaultProps = {
            qrCodeImage: '',
            amount: null,
            paymentData: null,
            onError: () => {},
            onComplete: () => {}
        };

        /**
         * Formats props on construction time
         * @return {object} props
         */
        formatProps(props) {
            const qrCodeImage = props.qrCodeData ? `${props.loadingContext}${QRCODE_URL}${props.qrCodeData}` : props.qrCodeImage;

            return {
                ...props,
                qrCodeImage
            };
        }

        /**
         * Formats the component data output
         * @return {object} props
         */
        formatData() {
            return {
                paymentMethod: {
                    type: this.props.type || QRLoaderContainer.type,
                    ...this.state.data
                }
            };
        }

        /**
         * Returns whether the component state is valid or not
         * @return {boolean} isValid
         */
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
                            shouldRedirectOnMobile={shouldRedirectOnMobile}
                            type={QRLoaderContainer.type}
                            brandLogo={brandLogo || this.icon}
                            delay={STATUS_INTERVAL}
                            onComplete={this.onComplete}
                            countdownTime={COUNTDOWN_MINUTES}
                        />
                    </CoreProvider>
                );
            }

            if (this.props.showPayButton) {
                return this.payButton({
                    label: buttonLabel ? this.props.i18n.get(buttonLabel) : this.props.i18n.get('continue'),
                    classNameModifiers: ['standalone']
                });
            }

            return null;
        }
    }

    return QRLoaderContainer;
};

export default withQRLoader;
