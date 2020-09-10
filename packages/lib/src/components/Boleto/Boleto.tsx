import { h } from 'preact';
import UIElement from '../UIElement';
import BoletoInput from './components/BoletoInput';
import { cleanCPFCNPJ } from './components/BoletoInput/utils';
import BoletoVoucherResult from './components/BoletoVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';

export class BoletoElement extends UIElement {
    public static type = 'boletobancario';

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { data = {} } = this.state;
        const { billingAddress, shopperEmail, firstName, lastName, socialSecurityNumber = '' } = data;

        return {
            paymentMethod: {
                type: this.props.type || BoletoElement.type
            },
            ...(billingAddress && { billingAddress }),
            ...(shopperEmail && { shopperEmail }),
            ...(firstName && lastName && { shopperName: { firstName, lastName } }),
            ...(socialSecurityNumber && { socialSecurityNumber: cleanCPFCNPJ(socialSecurityNumber) })
        };
    }

    private handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.reference ? (
                    <BoletoVoucherResult ref={this.handleRef} icon={this.icon} {...this.props} />
                ) : (
                    <BoletoInput ref={this.handleRef} {...this.props} onChange={this.setState} onSubmit={this.submit} payButton={this.payButton} />
                )}
            </CoreProvider>
        );
    }
}

export default BoletoElement;
