import { h } from 'preact';
import QRLoaderContainer from '../helpers/QRLoaderContainer/QRLoaderContainer';
import PixInput from './components/PixInput';
import { cleanCPFCNPJ } from '../internal/SocialSecurityNumberBrazil/utils';
import { PixElementData, PixConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import { QRLoader } from '../internal/QRLoader';
import PixQRDetails from './components/PixQRDetails';
import './Pix.scss';

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

    formatProps(props: PixConfiguration): PixConfiguration {
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

    renderQRCode() {
        return (
            <QRLoader
                {...this.props}
                type={this.type}
                brandLogo={this.props.brandLogo || this.icon}
                onComplete={this.onComplete}
                onActionHandled={this.onActionHandled}
                brandName={this.displayName}
                onSubmitAnalytics={this.submitAnalytics}
            >
                <PixQRDetails />
            </QRLoader>
        );
    }

    protected override componentToRender(): h.JSX.Element {
        if (this.props.paymentData) {
            return this.renderQRCode();
        }

        return (
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
        );
    }
}

export default PixElement;
