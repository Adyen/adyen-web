import { h } from 'preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

import type { PayPalPayLaterConfiguration, SupportedPayPalFundingSources } from './types';

import { BasePaypalElement } from './models/BasePaypalElement';
import { PayPalPaylaterComponent } from './components/PaypalPaylaterComponent';
import { PayPalComponents } from './paypal-js-types';
import './Paypal.scss';

class PaypalPaylaterElement extends BasePaypalElement<PayPalPayLaterConfiguration> {
    public static readonly type = TxVariants.paypal_paylater;

    protected override fundingSource: SupportedPayPalFundingSources = 'paylater';
    protected override elementName: string = 'PayPalPaylater';

    public override get icon(): string {
        return this.resources.getImage()('paypal');
    }

    protected override get paypalComponents(): PayPalComponents {
        return ['paypal-payments', 'paypal-messages'];
    }

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.props.showPayButton) return null;

        const { onShippingAddressChange, onShippingOptionsChange } = this.props;

        if (!this.paypalService) return null;

        return (
            <PayPalPaylaterComponent
                setComponentRef={this.setComponentRef}
                paypalService={this.paypalService}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChange })}
                {...(onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChange })}
                commit={this.props.commit}
                presentationModeOptions={this.props.presentationModeOptions}
                hidePayPalMessaging={this.props.hidePayPalMessaging}
                countryCode={this.props.countryCode}
                onSubmit={this.handleSubmit}
                onApprove={this.handleOnApprove}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
            />
        );
    }
}

export default PaypalPaylaterElement;
