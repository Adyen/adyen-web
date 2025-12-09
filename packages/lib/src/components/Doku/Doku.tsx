import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import DokuInput from './components/DokuInput';
import DokuVoucherResult from './components/DokuVoucherResult';
import { TxVariants } from '../tx-variants';
import { VoucherConfiguration } from '../internal/Voucher/types';

export class DokuElement extends UIElement<VoucherConfiguration> {
    public static type = TxVariants.doku;
    public static txVariants = [
        TxVariants.doku,
        TxVariants.doku_alfamart,
        TxVariants.doku_permata_lite_atm,
        TxVariants.doku_indomaret,
        TxVariants.doku_atm_mandiri_va,
        TxVariants.doku_sinarmas_va,
        TxVariants.doku_mandiri_va,
        TxVariants.doku_cimb_va,
        TxVariants.doku_danamon_va,
        TxVariants.doku_bri_va,
        TxVariants.doku_bni_va,
        TxVariants.doku_bca_va,
        TxVariants.doku_wallet
    ];

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.type
            }
        };
    }

    protected override componentToRender(): h.JSX.Element {
        return this.props.reference ? (
            <DokuVoucherResult
                ref={ref => {
                    this.componentRef = ref;
                }}
                {...this.props}
                onActionHandled={this.onActionHandled}
            />
        ) : (
            <DokuInput
                setComponentRef={this.setComponentRef}
                {...this.props}
                onChange={this.setState}
                onSubmit={this.submit}
                payButton={this.payButton}
            />
        );
    }
}

export default DokuElement;
