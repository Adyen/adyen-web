import { h } from 'preact';

import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import { BECSComponent } from './components/BECSComponent';
import { BECSResult } from './components/BECSResult';

import type { BECSConfiguration } from './types';

class BECS extends UIElement<BECSConfiguration> {
    public static readonly type = TxVariants.directdebit_AU;

    public override formatData() {
        return {
            paymentMethod: {
                type: BECS.type,
                ...(this.state.data?.holderName && { holderName: this.state.data.holderName }),
                ...(this.state.data?.bankAccountNumber && { bankAccountNumber: this.state.data.bankAccountNumber }),
                ...(this.state.data?.bankBranchCode && { bankBranchCode: this.state.data.bankBranchCode.replace('-', '') })
            },
            ...(this.state.data?.shopperEmail && { shopperEmail: this.state.data.shopperEmail })
        };
    }

    public override get isValid(): boolean {
        return !!this.state.isValid;
    }

    protected override componentToRender(): h.JSX.Element {
        return this.props.url ? (
            <BECSResult
                icon={this.props.icon ?? this.resources.getImage()('bankTransfer_IBAN')}
                onActionHandled={this.onActionHandled}
                paymentMethodType={this.type}
                url={this.props.url}
            />
        ) : (
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
