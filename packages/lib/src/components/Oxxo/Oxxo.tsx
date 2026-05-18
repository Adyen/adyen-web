import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import OxxoVoucherResult from './components/OxxoVoucherResult';
import { TxVariants } from '../tx-variants';
import { VoucherConfiguration } from '../internal/Voucher/types';

export class OxxoElement extends UIElement<VoucherConfiguration> {
    public static readonly type = TxVariants.oxxo;

    protected static readonly defaultProps = {
        name: 'Oxxo'
    };

    get isValid(): boolean {
        return true;
    }

    formatData() {
        return {
            paymentMethod: {
                type: this.props.type || OxxoElement.type
            }
        };
    }

    protected override componentToRender(): h.JSX.Element {
        return this.props.reference ? (
            <OxxoVoucherResult {...this.props} onActionHandled={this.onActionHandled} />
        ) : (
            this.props.showPayButton &&
                this.payButton({
                    ...this.props,
                    classNameModifiers: ['standalone'],
                    label: `${this.props.i18n.get('continueTo')} ${this.props.name}`,
                    onClick: this.submit
                })
        );
    }
}

export default OxxoElement;
