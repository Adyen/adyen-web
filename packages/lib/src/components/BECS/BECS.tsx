import { h } from 'preact';

import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import { BECSComponent } from './components/BECSComponent';

import type { BECSConfiguration } from './types';

class BECS extends UIElement<BECSConfiguration> {
    public static readonly type = TxVariants.directdebit_AU;

    public override formatData() {
        return {
            paymentMethod: {
                type: BECS.type,
                holderName: this.state.data.holderName,
                bankAccountNumber: this.state.data.bankAccountNumber,
                bankBranchCode: this.state.data.bankBranchCode.replace('-', '')
            },
            shopperEmail: this.state.data.shopperEmail
        };
    }

    public override get isValid(): boolean {
        return !!this.state.isValid;
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <BECSComponent
                data={this.props.data}
                onChange={this.setState}
                payButton={this.payButton}
                placeholders={this.props.placeholders}
                setComponentRef={this.setComponentRef}
                showPayButton={this.props.showPayButton}
            />
        );
    }
}

export default BECS;
