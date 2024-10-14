import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import BoletoInput from './components/BoletoInput';
import { cleanCPFCNPJ } from '../internal/SocialSecurityNumberBrazil/utils';
import BoletoVoucherResult from './components/BoletoVoucherResult';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import { VoucherConfiguration } from '../internal/Voucher/types';

export class BoletoElement extends UIElement<VoucherConfiguration> {
    public static type = TxVariants.boletobancario;

    public static txVariants = [
        TxVariants.boletobancario,
        TxVariants.boletobancario_itau,
        TxVariants.boletobancario_santander,
        TxVariants.primeiropay_boleto
    ];

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
                type: this.type
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <BoletoVoucherResult ref={this.handleRef} icon={this.icon} {...this.props} onActionHandled={this.onActionHandled} />
                ) : (
                    <BoletoInput
                        setComponentRef={this.handleRef}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default BoletoElement;
