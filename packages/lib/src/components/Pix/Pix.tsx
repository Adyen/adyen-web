import QRLoaderContainer from '../helpers/QRLoaderContainer';
import CoreProvider from '../../core/Context/CoreProvider';
import { h } from 'preact';
import PixInput from './PixInput';
import { cleanCPFCNPJ } from '../internal/SocialSecurityNumberBrazil/utils';
import { PixProps } from './types';

class PixElement extends QRLoaderContainer<PixProps> {
    public static type = 'pix';

    public static defaultProps = {
        personalDetailsRequired: false,
        ...QRLoaderContainer.defaultProps
    };

    get isValid() {
        return !!this.state.isValid;
    }

    formatProps(props) {
        return {
            delay: 2000, // ms
            countdownTime: 15, // min
            copyBtn: true,
            introduction: 'pix.instructions',
            ...super.formatProps(props)
        };
    }

    formatData() {
        const { data = {} } = this.state;
        const { firstName, lastName, socialSecurityNumber = '' } = data;

        return {
            paymentMethod: {
                type: this.props.type || this.constructor['type']
            },
            ...(firstName && lastName && { shopperName: { firstName, lastName } }),
            ...(socialSecurityNumber && { socialSecurityNumber: cleanCPFCNPJ(socialSecurityNumber) })
        };
    }

    render() {
        if (this.props.paymentData) {
            return this.renderQRCode();
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <PixInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default PixElement;
