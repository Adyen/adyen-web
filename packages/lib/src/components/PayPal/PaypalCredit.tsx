import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { BasePayPalConfiguration, SupportedPayPalFundingSources } from './types';

import { BasePaypalElement } from './models/BasePaypalElement';
import { PaypalCreditComponent } from './components/PaypalCreditComponent';

class PaypalCreditElement extends BasePaypalElement<BasePayPalConfiguration> {
    public static readonly type = TxVariants.paypal_credit;

    protected override fundingSource: SupportedPayPalFundingSources = 'credit';
    protected override elementName: string = 'PayPalCredit';

    public override get icon(): string {
        return this.resources.getImage()('paypal');
    }

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.props.showPayButton) return null;

        const { onShippingAddressChange, onShippingOptionsChange } = this.props;

        if (!this.paypalService) return null;

        return (
            <PaypalCreditComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChange })}
                {...(onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChange })}
                commit={this.props.commit}
                vault={this.props.vault}
                presentationModeOptions={this.props.presentationModeOptions}
                countryCode={this.props.countryCode}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default PaypalCreditElement;
