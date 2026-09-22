import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { PayPalCreditConfiguration, SupportedPayPalFundingSources } from './types';

import { BasePayPalElement } from './models/BasePayPalElement';
import { PayPalCreditComponent } from './components/PayPalCreditComponent';

class PayPalCreditElement extends BasePayPalElement<PayPalCreditConfiguration> {
    public static readonly type = TxVariants.paypal_credit;

    protected override fundingSource: SupportedPayPalFundingSources = 'credit';

    public override get icon(): string {
        return this.resources.getImage()(TxVariants.paypal);
    }

    protected override componentToRender(): h.JSX.Element | null {
        const { onShippingAddressChange, onShippingOptionsChange } = this.props;

        if (!this.paypalService) return null;

        return (
            <PayPalCreditComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChange })}
                {...(onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChange })}
                commit={this.props.commit}
                vault={this.props.vault}
                presentationModeOptions={this.props.presentationModeOptions}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default PayPalCreditElement;
