import { h } from 'preact';
import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import { CoreProvider } from '../../core/Context/CoreProvider';
import PixInput from './PixInput';
import { cleanCPFCNPJ } from '../internal/SocialSecurityNumberBrazil/utils';
import { PixElementData, PixConfiguration } from './types';
import { TxVariants } from '../tx-variants';

class PixElement extends QRLoaderContainer<PixConfiguration> {
    public static type = TxVariants.pix;

    public static defaultProps = {
        personalDetailsRequired: false,
        countdownTime: 15,
        delay: 2000,
        ...QRLoaderContainer.defaultProps
    };

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    formatProps(props): PixConfiguration {
        return {
            copyBtn: true,
            introduction: 'pix.instructions',
            ...super.formatProps(props)
        };
    }

    formatData(): PixElementData {
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PixInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    showPayButton={this.props.showPayButton}
                    personalDetailsRequired={this.props.personalDetailsRequired}
                    name={this.displayName}
                    onChange={this.setState}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default PixElement;
